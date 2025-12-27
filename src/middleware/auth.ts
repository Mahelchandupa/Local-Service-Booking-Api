import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../types';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to req.user
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      sendErrorResponse(
        res,
        'Authentication required. Please provide a valid token.',
        HttpStatus.UNAUTHORIZED
      );
      return;
    }

    const decoded = verifyToken(token);
    (req as AuthRequest).user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed';
    sendErrorResponse(res, message, HttpStatus.UNAUTHORIZED);
  }
};

/**
 * Authorization middleware factory
 * Creates middleware that allows only specified roles
 */
export const authorize = (...allowedRoles: Array<'customer' | 'service_provider' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      sendErrorResponse(
        res,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
      return;
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      sendErrorResponse(
        res,
        'You do not have permission to access this resource',
        HttpStatus.FORBIDDEN
      );
      return;
    }

    next();
  };
};

/**
 * Convenience middleware for specific roles
 */
export const requireAdmin = authorize('admin');
export const requireCustomer = authorize('customer');
export const requireProvider = authorize('service_provider');
export const requireAdminOrProvider = authorize('admin', 'service_provider');

