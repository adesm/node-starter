import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';
import { errorResponse } from '../utils/response';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    const message = formattedErrors[0]?.message ?? 'Validation Error';
    return errorResponse(res, 400, message, formattedErrors);
  }

  if (err instanceof AppError) {
    return errorResponse(res, err.statusCode, err.message);
  }

  logger.error('Unhandled request error', { err });
  return errorResponse(res, 500, 'Internal Server Error');
};
