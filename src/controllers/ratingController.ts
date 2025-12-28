import { Request, Response, NextFunction } from 'express';
import {
  createRating,
  getRatingsByProvider,
  getRatingByServiceRequest,
} from '../services/ratingService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../types';
import { Customer } from '../models';

/**
 * Create a new rating
 * POST /api/ratings
 * Access: Customer only
 */
export const createRatingController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;

    // Get customer ID from user ID
    const customer = await Customer.findOne({ userId });
    if (!customer) {
      sendErrorResponse(res, 'Customer profile not found', HttpStatus.NOT_FOUND);
      return;
    }

    const rating = await createRating(req.body, customer._id.toString());

    sendSuccessResponse(
      res,
      'Rating submitted successfully',
      rating,
      HttpStatus.CREATED
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create rating';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Not authorized') || message.includes('already exists')
      ? HttpStatus.FORBIDDEN
      : message.includes('Invalid') || 
        message.includes('Can only rate') || 
        message.includes('must be between')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Get ratings for a service provider
 * GET /api/ratings/provider/:providerId
 * Access: Public (any authenticated user)
 */
export const getRatingsByProviderController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { page, limit } = req.query;

    const result = await getRatingsByProvider(
      providerId,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    sendSuccessResponse(
      res,
      'Ratings retrieved successfully',
      result,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve ratings';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Get rating for a specific service request
 * GET /api/ratings/service-request/:id
 * Access: Public (any authenticated user)
 */
export const getRatingByServiceRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const rating = await getRatingByServiceRequest(id);
    
    if (!rating) {
      sendErrorResponse(
        res,
        'No rating found for this service request',
        HttpStatus.NOT_FOUND
      );
      return;
    }

    sendSuccessResponse(
      res,
      'Rating retrieved successfully',
      rating,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve rating';
    const statusCode = message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};