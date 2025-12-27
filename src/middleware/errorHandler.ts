import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';

/**
 * Custom Error class for application errors
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';

  // Handle known AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle MongoDB duplicate key errors
  else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    message = 'Duplicate entry detected';
  }
  // Handle MongoDB validation errors
  else if (err.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = err.message;
  }
  // Handle Cast errors (invalid ObjectId, etc.)
  else if (err.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid ID format';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Invalid token';
  }
  // Handle JWT expiration errors
  else if (err.name === 'TokenExpiredError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Token expired';
  }
  // Log unexpected errors in development
  else if (process.env.NODE_ENV === 'development') {
    console.error('Unexpected error:', err);
    message = err.message || message;
  }

  // Send error response
  sendErrorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors and pass them to errorHandler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

