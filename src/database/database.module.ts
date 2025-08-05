import {
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolClient } from 'pg';
import * as schema from '../database';
import { DATABASE_HEALTH_INTERVAL } from './constants';
import { DATABASE_CONNECTION } from './database-connection';
import { DatabaseHealthService } from './health.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_HEALTH_INTERVAL,
      useValue: 120,
    },
    {
      provide: 'DB_POOL',
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabasePool');

        const poolConfig = {
          connectionString: configService.getOrThrow<string>('DATABASE_URL'),
          max: configService.get<number>('DB_POOL_MAX', 20),
          min: configService.get<number>('DB_POOL_MIN', 2),
          idleTimeoutMillis: configService.get<number>(
            'DB_IDLE_TIMEOUT',
            30000,
          ),
          connectionTimeoutMillis: configService.get<number>(
            'DB_CONN_TIMEOUT',
            10000,
          ),
          maxUses: configService.get<number>('DB_MAX_USES', 7500),
          application_name: 'nestjs_app',
          keepAlive: true,
          keepAliveInitialDelayMillis: 0,
        };

        const pool = new Pool(poolConfig);

        // Pool event listeners
        pool.on('error', (err) =>
          logger.error('Unexpected error on idle client', err),
        );
        pool.on('connect', (client: PoolClient) => {
          logger.debug('New client connected to database');
          client.on('error', (error) => logger.error('Client error', error));
        });
        pool.on('remove', () => logger.debug('Client removed from pool'));

        // Test connection with retry
        await testConnectionWithRetry(pool, logger, 3, 2000);

        return pool;
      },
      inject: [ConfigService],
    },
    {
      provide: DATABASE_CONNECTION,
      useFactory: (pool: Pool) => {
        const logger = new Logger('DatabaseConnection');
        const db = drizzle(pool, { schema });
        return createReconnectingDatabase(db, pool, logger);
      },
      inject: ['DB_POOL'],
    },
    DatabaseHealthService,
  ],
  exports: [DATABASE_CONNECTION, DatabaseHealthService],
})
export class DatabaseModule implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject('DB_POOL') private readonly pool: Pool) {}

  async onModuleDestroy() {
    this.logger.log('Closing database connections...');
    try {
      await this.pool.end();
      this.logger.log('Database pool closed successfully');
    } catch (error) {
      this.logger.error('Error closing database pool:', error);
    }
  }
}

// Connection test with retry
async function testConnectionWithRetry(
  pool: Pool,
  logger: Logger,
  maxRetries: number,
  delayMs: number,
): Promise<void> {
  let retries = maxRetries;

  while (retries > 0) {
    try {
      const client = await pool.connect();
      try {
        await client.query('SELECT NOW()');
        logger.log('Successfully connected to database');
        return;
      } finally {
        client.release();
      }
    } catch (error: any) {
      retries--;
      logger.error(
        `Failed to connect to DB. Retries left: ${retries}`,
        error.message,
      );

      if (retries === 0) {
        await pool.end();
        throw new Error(
          `Failed to connect to DB after ${maxRetries} attempts: ${error.message}`,
        );
      }

      await wait(delayMs);
      delayMs *= 1.5; // Exponential backoff
    }
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Enhanced reconnecting database wrapper
function createReconnectingDatabase(db: any, pool: Pool, logger: Logger) {
  // Circuit breaker state
  let consecutiveFailures = 0;
  const maxFailures = 5;
  let circuitOpen = false;
  let lastFailureTime = 0;
  const circuitTimeout = 30000; // 30 seconds

  // Store original execute method
  const originalExecute = db.execute.bind(db);

  // Enhanced execute with circuit breaker and retry
  const executeWithResilience = async function <T = any>(
    query: any,
  ): Promise<T> {
    // Check circuit breaker
    if (circuitOpen) {
      if (Date.now() - lastFailureTime > circuitTimeout) {
        circuitOpen = false;
        consecutiveFailures = 0;
        logger.log('🔄 Circuit breaker reset - attempting reconnection');
      } else {
        throw new Error(
          'Circuit breaker is open - database temporarily unavailable',
        );
      }
    }

    let retries = 3;
    let lastError: Error;

    while (retries > 0) {
      try {
        const result = await originalExecute(query);
        consecutiveFailures = 0; // Reset on success
        return result;
      } catch (error: any) {
        lastError = error;
        const isConnectionError = isConnectionRelatedError(error);

        if (isConnectionError && retries > 1) {
          retries--;
          const backoffDelay = (4 - retries) * 1000;
          logger.warn(
            `🔌 Connection error detected, retrying in ${backoffDelay}ms... (${retries} attempts left)`,
          );
          await wait(backoffDelay);
          continue;
        }

        // Track failures for circuit breaker
        consecutiveFailures++;
        lastFailureTime = Date.now();

        if (consecutiveFailures >= maxFailures) {
          circuitOpen = true;
          logger.error(
            `⚡ Circuit breaker opened after ${maxFailures} consecutive failures`,
          );
        }

        logger.error('💥 Database query failed:', error.message);
        throw error;
      }
    }

    throw lastError!;
  };

  // Health check with timeout
  const healthCheck = async function (): Promise<boolean> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), 5000),
      );

      const healthPromise = (async () => {
        const client = await pool.connect();
        try {
          await client.query('SELECT 1 as health');
          return true;
        } finally {
          client.release();
        }
      })();

      await Promise.race([healthPromise, timeoutPromise]);
      return true;
    } catch (error: any) {
      logger.debug('❤️‍🩹 Health check failed:', error.message);
      return false;
    }
  };

  // Get comprehensive pool and circuit info
  const getPoolInfo = function () {
    return {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
  };

  const getMetrics = function () {
    return {
      pool: getPoolInfo(),
      circuit: {
        isOpen: circuitOpen,
        consecutiveFailures,
        lastFailureTime: lastFailureTime > 0 ? new Date(lastFailureTime) : null,
      },
    };
  };

  // Reconnect method (if supported by underlying connection)
  const reconnect = async function () {
    logger.log('🔄 Attempting database reconnection...');
    try {
      // Reset circuit breaker
      circuitOpen = false;
      consecutiveFailures = 0;

      // Test connection
      const isHealthy = await healthCheck();
      if (isHealthy) {
        logger.log('✅ Database reconnection successful');
      } else {
        logger.warn(
          '⚠️ Database reconnection completed but health check failed',
        );
      }
      return isHealthy;
    } catch (error: any) {
      logger.error('❌ Database reconnection failed:', error.message);
      return false;
    }
  };

  const close = async function () {
    logger.log('🔒 Closing database connection...');
    await pool.end();
  };

  // Enhance db object
  db.execute = executeWithResilience;
  db.healthCheck = healthCheck;
  db.getPoolInfo = getPoolInfo;
  db.getMetrics = getMetrics;
  db.reconnect = reconnect;
  db.close = close;

  return db;
}

// Helper function to identify connection-related errors
function isConnectionRelatedError(error: any): boolean {
  const connectionErrorMessages = [
    'Connection terminated',
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'connection is closed',
    'Client has encountered a connection error',
  ];

  const connectionErrorCodes = [
    'ECONNRESET',
    '57P01',
    '08003',
    '08006',
    '08001',
  ];

  return (
    connectionErrorMessages.some((msg) => error.message?.includes(msg)) ||
    connectionErrorCodes.includes(error.code)
  );
}
