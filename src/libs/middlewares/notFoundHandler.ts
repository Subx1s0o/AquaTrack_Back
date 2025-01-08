import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from 'routing-controllers';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!res.headersSent) {
    next(new NotFoundError('Not Found'));
  } else {
    next();
  }
};
