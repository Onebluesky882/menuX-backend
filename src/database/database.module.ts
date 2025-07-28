import { Module, Logger, OnModuleDestroy, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';
import { DATABASE_CONNECTION } from './database-connection';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../database';
import * as dotenv from 'dotenv';
import { DatabaseHealthService } from './health.service';

dotenv.config();

@Global() // ทำให้ module นี้เป็น global
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseConnection');

        // Pool configuration with reconnection settings
        const poolConfig = {
          connectionString: configService.getOrThrow('DATABASE_URL'),
          // Connection pool settings
          max: 20, // maximum number of clients in the pool
          min: 2, // minimum number of clients in the pool
          idleTimeoutMillis: 30000, // close idle clients after 30 seconds
          connectionTimeoutMillis: 10000, // return an error after 10 seconds if connection could not be established
          maxUses: 7500, // close (and replace) a connection after it has been used 7500 times

          // Reconnection settings
          application_name: 'nestjs_app',
          keepAlive: true,
          keepAliveInitialDelayMillis: 0,
        };

        const pool = new Pool(poolConfig);

        // Handle pool errors
        pool.on('error', (err, client) => {
          logger.error('❌ Unexpected error on idle client:', err);
        });

        pool.on('connect', (client: PoolClient) => {
          logger.log('✅ New client connected to database');

          client.on('error', (err) => {
            logger.error('❌ Client error:', err);
          });
        });

        pool.on('acquire', () => {
          logger.debug('🔗 Client acquired from pool');
        });

        pool.on('release', () => {
          logger.debug('🔓 Client released back to pool');
        });

        // Test initial connection with retry logic
        let retries = 3;
        let connected = false;

        while (retries > 0 && !connected) {
          try {
            const client = await pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            connected = true;
            logger.log('✅ Successfully connected to database');
          } catch (error) {
            retries--;
            logger.error(
              `❌ Failed to connect to DB. Retries left: ${retries}`,
              error.message,
            );

            if (retries === 0) {
              await pool.end();
              throw new Error(
                `Failed to connect to database after 3 attempts: ${error.message}`,
              );
            }

            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        const db = drizzle(pool, { schema });
        return createReconnectingDatabase(db, pool, logger);
      },
      inject: [ConfigService],
    },
    DatabaseHealthService, // เพิ่ม health service ที่นี่
  ],
  exports: [DATABASE_CONNECTION, DatabaseHealthService], // export ทั้งสองตัว
})
export class DatabaseModule implements OnModuleDestroy {
  private logger = new Logger(DatabaseModule.name);

  async onModuleDestroy() {
    this.logger.log('🔄 Closing database connections...');
  }
}

// Helper function to create reconnecting database wrapper
function createReconnectingDatabase(db: any, pool: Pool, logger: Logger) {
  const originalQuery = db.execute.bind(db);

  db.execute = async function (query: any) {
    let retries = 3;

    while (retries > 0) {
      try {
        return await originalQuery(query);
      } catch (error) {
        const isConnectionError =
          error.message.includes('Connection terminated') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ETIMEDOUT') ||
          error.code === 'ECONNRESET' ||
          error.code === '57P01';

        if (isConnectionError && retries > 1) {
          retries--;
          logger.warn(
            `🔄 Connection error detected, retrying... (${retries} attempts left)`,
          );

          const delay = (4 - retries) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        logger.error('❌ Database query failed:', error.message);
        throw error;
      }
    }
  };

  db.healthCheck = async function () {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1 as health');
      client.release();
      return true;
    } catch (error) {
      logger.error('❌ Health check failed:', error.message);
      return false;
    }
  };

  db.getPoolInfo = function () {
    return {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
  };

  return db;
}
