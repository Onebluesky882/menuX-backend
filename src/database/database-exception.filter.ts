import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Injectable()
@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  // เก็บ patterns ไว้ที่ class-level (สร้างครั้งเดียว)
  private static readonly connectionErrorPatterns = [
    'connection terminated unexpectedly',
    'connection terminated',
    'econnreset',
    'enotfound',
    'etimedout',
    'connection timeout',
    'server closed the connection',
    'connection lost',
    'pool is closed',
    'cannot use a pool after calling end',
  ];

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    if (this.isDatabaseConnectionError(exception)) {
      this.logger.error(
        `🚨 Database connection error on ${request.method} ${request.url}: ${exception.message}`,
      );

      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database service temporarily unavailable. Please try again.',
        timestamp: new Date().toISOString(),
        path: request.url,
        error: 'Service Unavailable',
      });
      return;
    }

    // Handle other exceptions
    const status =
      typeof exception.getStatus === 'function'
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal server error';

    this.logger.error(
      `❌ Application error on ${request.method} ${request.url}: ${message}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private isDatabaseConnectionError(exception: any): boolean {
    if (!exception || typeof exception.message !== 'string') return false;

    const errorMessage = exception.message.toLowerCase();

    return DatabaseExceptionFilter.connectionErrorPatterns.some((pattern) =>
      errorMessage.includes(pattern),
    );
  }
}
