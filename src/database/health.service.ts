import {
  Injectable,
  Logger,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from './database-connection';

@Injectable()
export class DatabaseHealthService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(DatabaseHealthService.name);
  private isHealthy = true;
  private lastHealthCheck = new Date();
  private healthCheckInterval: NodeJS.Timeout;

  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  onModuleInit() {
    // Start health check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000);

    // Run initial health check
    this.performHealthCheck();
  }

  onModuleDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  async performHealthCheck() {
    try {
      const isHealthy = await this.db.healthCheck();

      if (!isHealthy && this.isHealthy) {
        this.logger.error('🚨 Database connection lost!');
        this.isHealthy = false;
      } else if (isHealthy && !this.isHealthy) {
        this.logger.log('✅ Database connection restored!');
        this.isHealthy = true;
      }

      this.lastHealthCheck = new Date();

      // Log pool info periodically
      if (this.isHealthy) {
        const poolInfo = this.db.getPoolInfo();
        this.logger.debug(
          `📊 Pool Status - Total: ${poolInfo.totalCount}, Idle: ${poolInfo.idleCount}, Waiting: ${poolInfo.waitingCount}`,
        );
      }
    } catch (error) {
      this.logger.error('❌ Health check error:', error.message);
      this.isHealthy = false;
    }
  }

  getHealthStatus() {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastHealthCheck,
      poolInfo: this.db.getPoolInfo(),
    };
  }

  async forceReconnect() {
    this.logger.log('🔄 Forcing database reconnection...');
    try {
      await this.performHealthCheck();
      return this.isHealthy;
    } catch (error) {
      this.logger.error('❌ Force reconnect failed:', error.message);
      return false;
    }
  }
}
