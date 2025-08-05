import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DATABASE_HEALTH_INTERVAL } from './constants';
import { DATABASE_CONNECTION } from './database-connection';

@Injectable()
export class DatabaseHealthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseHealthService.name);
  private isHealthy = true;
  private lastHealthCheck = new Date(0);
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;
  private performingCheck = false;

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    @Inject(DATABASE_HEALTH_INTERVAL) private readonly intervalSeconds: number,
  ) {
    this.intervalMs = intervalSeconds * 1000;
  }

  onModuleInit() {
    this.performHealthCheck(); // initial check

    this.healthCheckInterval = setInterval(() => {
      if (this.performingCheck) {
        // ป้องกันเรียกซ้อน
        this.logger.debug('Health check skipped to avoid overlap.');
        return;
      }
      this.performHealthCheck();
    }, this.intervalMs);
  }

  onModuleDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  async performHealthCheck() {
    this.performingCheck = true;
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

      // Log pool info เฉพาะตอน healthy เท่านั้น
      if (this.isHealthy && typeof this.db.getPoolInfo === 'function') {
        const poolInfo = this.db.getPoolInfo();
        this.logger.debug(
          `📊 Pool Status - Total: ${poolInfo.totalCount}, Idle: ${poolInfo.idleCount}, Waiting: ${poolInfo.waitingCount}`,
        );
      }
    } catch (error) {
      if (this.isHealthy) {
        this.logger.error('❌ Health check error:', error.message);
      } else {
        this.logger.debug('Health check error while unhealthy:', error.message);
      }
      this.isHealthy = false;
    } finally {
      this.performingCheck = false;
    }
  }

  getHealthStatus() {
    let poolInfo = null;
    if (typeof this.db.getPoolInfo === 'function') {
      try {
        poolInfo = this.db.getPoolInfo();
      } catch {
        poolInfo = null;
      }
    }

    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastHealthCheck,
      poolInfo,
    };
  }

  async forceReconnect() {
    this.logger.log('🔄 Forcing database reconnection...');
    try {
      // สมมติว่าฐานข้อมูลมี method reconnect จริง (ถ้าไม่มี อาจต้อง implement เอง)
      if (typeof this.db.reconnect === 'function') {
        await this.db.reconnect();
      }
      // หลังจาก reconnect ตรวจสุขภาพอีกที
      await this.performHealthCheck();
      return this.isHealthy;
    } catch (error) {
      this.logger.error('❌ Force reconnect failed:', error.message);
      return false;
    }
  }
}
