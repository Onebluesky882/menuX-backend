import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DATABASE_CONNECTION } from './database-connection';

@Injectable()
export class DatabaseHealthService {
  private logger = new Logger(DatabaseHealthService.name);
  private isHealthy = true;
  private lastHealthCheck = new Date();

  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  // Run health check every 30 seconds
  @Cron(CronExpression.EVERY_30_SECONDS)
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
