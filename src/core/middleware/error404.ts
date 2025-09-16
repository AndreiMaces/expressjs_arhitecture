import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response.util';

export const error404 = (req: Request, res: Response, next: NextFunction) => {
  ResponseHelper.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
};
