import { Response, Request } from 'express';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';
import { Logger } from './logger.util';

export class ResponseHelper {
  static success<T>(res: Response, status: number, data: T, req?: Request): void {
    const response: ApiResponse<T> = {
      status,
      errors: [],
      data
    };
    
    // Log successful response
    if (req) {
      const responseTime = Date.now() - (req.startTime || Date.now());
      Logger.logRequest(
        req.method,
        req.originalUrl,
        status,
        responseTime,
        {
          requestId: req.headers['x-request-id'] as string,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: (req as any).user?.id
        }
      );
    }
    
    res.status(status).json(response);
  }

  static error(res: Response, status: number, errors: string | string[], req?: Request): void {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    const response: ApiResponse<null> = {
      status,
      errors: errorArray,
      data: null
    };
    
    // Log error response
    if (req) {
      const responseTime = Date.now() - (req.startTime || Date.now());
      Logger.logApiError(
        req.method,
        req.originalUrl,
        status,
        errorArray.join(', '),
        {
          requestId: req.headers['x-request-id'] as string,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: (req as any).user?.id
        }
      );
    }
    
    res.status(status).json(response);
  }

  static badRequest(res: Response, errors: string | string[], req?: Request): void {
    this.error(res, 400, errors, req);
  }

  static unauthorized(res: Response, errors: string | string[] = 'Unauthorized', req?: Request): void {
    this.error(res, 401, errors, req);
  }

  static forbidden(res: Response, errors: string | string[] = 'Forbidden', req?: Request): void {
    this.error(res, 403, errors, req);
  }

  static notFound(res: Response, errors: string | string[] = 'Not Found', req?: Request): void {
    this.error(res, 404, errors, req);
  }

  static conflict(res: Response, errors: string | string[] = 'Conflict', req?: Request): void {
    this.error(res, 409, errors, req);
  }

  static internalError(res: Response, errors: string | string[] = 'Internal Server Error', req?: Request): void {
    this.error(res, 500, errors, req);
  }

  static created<T>(res: Response, data: T, req?: Request): void {
    this.success(res, 201, data, req);
  }

  static ok<T>(res: Response, data: T, req?: Request): void {
    this.success(res, 200, data, req);
  }

  static noContent(res: Response, req?: Request): void {
    // Log no content response
    if (req) {
      const responseTime = Date.now() - (req.startTime || Date.now());
      Logger.logRequest(
        req.method,
        req.originalUrl,
        204,
        responseTime,
        {
          requestId: req.headers['x-request-id'] as string,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: (req as any).user?.id
        }
      );
    }
    
    res.status(204).send();
  }
}
