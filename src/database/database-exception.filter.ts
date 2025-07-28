import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';

@Injectable()
@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private logger = new Logger(DatabaseExceptionFilter.name);

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Check if it's a database connection error
    const isDatabaseError = this.isDatabaseConnectionError(exception);

    if (isDatabaseError) {
      this.logger.error(
        `🚨 Database connection error on ${request.method} ${request.url}:`,
        exception.message,
      );

      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database service temporarily unavailable. Please try again.',
        timestamp: new Date().toISOString(),
        path: request.url,
        error: 'Service Unavailable',
      });
    } else {
      // Handle other exceptions
      const status = exception.getStatus
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = exception.message || 'Internal server error';

      this.logger.error(
        `❌ Application error on ${request.method} ${request.url}:`,
        exception.message,
      );

      response.status(status).json({
        statusCode: status,
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }

  private isDatabaseConnectionError(exception: any): boolean {
    if (!exception.message) return false;

    const connectionErrorPatterns = [
      'Connection terminated unexpectedly',
      'Connection terminated',
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      'connection timeout',
      'server closed the connection',
      'Connection lost',
      'Pool is closed',
      'Cannot use a pool after calling end',
    ];

    const errorMessage = exception.message.toLowerCase();
    return connectionErrorPatterns.some((pattern) =>
      errorMessage.includes(pattern.toLowerCase()),
    );
  }
}
