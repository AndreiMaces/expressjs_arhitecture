import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

export class ResponseHelper {
  static success<T>(res: Response, status: number, data: T): void {
    const response: ApiResponse<T> = {
      status,
      errors: [],
      data
    };
    res.status(status).json(response);
  }

  static error(res: Response, status: number, errors: string | string[]): void {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    const response: ApiResponse<null> = {
      status,
      errors: errorArray,
      data: null
    };
    res.status(status).json(response);
  }

  static badRequest(res: Response, errors: string | string[]): void {
    this.error(res, 400, errors);
  }

  static unauthorized(res: Response, errors: string | string[] = 'Unauthorized'): void {
    this.error(res, 401, errors);
  }

  static forbidden(res: Response, errors: string | string[] = 'Forbidden'): void {
    this.error(res, 403, errors);
  }

  static notFound(res: Response, errors: string | string[] = 'Not Found'): void {
    this.error(res, 404, errors);
  }

  static conflict(res: Response, errors: string | string[] = 'Conflict'): void {
    this.error(res, 409, errors);
  }

  static internalError(res: Response, errors: string | string[] = 'Internal Server Error'): void {
    this.error(res, 500, errors);
  }

  static created<T>(res: Response, data: T): void {
    this.success(res, 201, data);
  }

  static ok<T>(res: Response, data: T): void {
    this.success(res, 200, data);
  }

  static noContent(res: Response): void {
    res.status(204).send();
  }
}
