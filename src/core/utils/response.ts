import { Response } from 'express';

export interface ErrorDetail {
  field: string;
  message: string;
}

export type ErrorPayload = ErrorDetail[] | Record<string, unknown>;

export const successResponse = <T>(res: Response, statusCode: number, message: string, data?: T) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: ErrorPayload
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
