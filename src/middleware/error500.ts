import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';

export const error500 = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);
  
  const errorMessage = process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong';
  ResponseHelper.internalError(res, errorMessage);
};
