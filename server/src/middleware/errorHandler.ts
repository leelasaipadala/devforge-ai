import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Express Error] ${req.method} ${req.originalUrl}:`, err?.message || err);

  res.status(statusCode).json({
    success: false,
    message: err?.message || 'An unexpected server error occurred.',
    stack: process.env.NODE_ENV === 'production' ? null : err?.stack,
  });
};
