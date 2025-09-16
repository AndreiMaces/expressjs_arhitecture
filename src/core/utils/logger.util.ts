import { LogRepository, CreateLogData } from '../repositories/log.repository';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogContext {
  userId?: number;
  requestId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export class Logger {
  /**
   * Log an info message
   */
  static async info(message: string, context?: LogContext): Promise<void> {
    await this.log('INFO', message, context);
  }

  /**
   * Log a warning message
   */
  static async warn(message: string, context?: LogContext): Promise<void> {
    await this.log('WARN', message, context);
  }

  /**
   * Log an error message
   */
  static async error(message: string, context?: LogContext): Promise<void> {
    await this.log('ERROR', message, context);
  }

  /**
   * Log a debug message
   */
  static async debug(message: string, context?: LogContext): Promise<void> {
    await this.log('DEBUG', message, context);
  }

  /**
   * Log a request/response cycle
   */
  static async logRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext
  ): Promise<void> {
    const message = `${method} ${endpoint} - ${statusCode} (${responseTime}ms)`;
    await this.log('INFO', message, {
      ...context,
      method,
      endpoint,
      statusCode,
      responseTime
    });
  }

  /**
   * Log an API error
   */
  static async logApiError(
    method: string,
    endpoint: string,
    statusCode: number,
    error: string,
    context?: LogContext
  ): Promise<void> {
    const message = `API Error: ${method} ${endpoint} - ${statusCode}: ${error}`;
    await this.log('ERROR', message, {
      ...context,
      method,
      endpoint,
      statusCode,
      error
    });
  }

  /**
   * Log authentication events
   */
  static async logAuth(
    event: 'login' | 'logout' | 'register' | 'token_refresh' | 'auth_failed',
    userId?: number,
    context?: LogContext
  ): Promise<void> {
    const message = `Auth event: ${event}`;
    await this.log('INFO', message, {
      ...context,
      userId,
      authEvent: event
    });
  }

  /**
   * Log database operations
   */
  static async logDatabase(
    operation: 'create' | 'read' | 'update' | 'delete',
    table: string,
    recordId?: number,
    context?: LogContext
  ): Promise<void> {
    const message = `Database ${operation}: ${table}${recordId ? ` (ID: ${recordId})` : ''}`;
    await this.log('DEBUG', message, {
      ...context,
      dbOperation: operation,
      table,
      recordId
    });
  }

  /**
   * Core logging method
   */
  private static async log(level: LogLevel, message: string, context?: LogContext): Promise<void> {
    try {
      const contextString = context ? JSON.stringify(context) : undefined;
      
      await LogRepository.create({
        level,
        message,
        context: contextString,
        userId: context?.userId
      });

      // Also log to console for development
      if (process.env.NODE_ENV !== 'production') {
        const timestamp = new Date().toISOString();
        const contextInfo = contextString ? ` | Context: ${contextString}` : '';
        console.log(`[${timestamp}] ${level}: ${message}${contextInfo}`);
      }
    } catch (error) {
      // Fallback to console if database logging fails
      console.error('Failed to log to database:', error);
      console.log(`[${new Date().toISOString()}] ${level}: ${message}`);
    }
  }

  /**
   * Log without awaiting (fire and forget)
   */
  static logAsync(level: LogLevel, message: string, context?: LogContext): void {
    this.log(level, message, context).catch(error => {
      console.error('Async logging failed:', error);
    });
  }
}
