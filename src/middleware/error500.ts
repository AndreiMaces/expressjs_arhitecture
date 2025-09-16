import { Request, Response, NextFunction } from 'express';

export const error500 = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
