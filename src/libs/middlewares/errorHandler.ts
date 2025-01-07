import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';

import { ZodError } from 'zod';
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Bad Request',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors || []
    });
    return;
  }

  res.status(500).json({
    message: 'Internal Server Error',
    errors: [err.message || 'Unknown error']
  });
};
