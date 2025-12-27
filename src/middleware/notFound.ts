import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  sendErrorResponse(
    res,
    `Route ${req.originalUrl} not found`,
    HttpStatus.NOT_FOUND
  );
};

