import { NextFunction, Request, Response } from 'express';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!res.headersSent) {
    res.status(404).json({ message: 'Not Found' });
  } else {
    next();
  }
};
