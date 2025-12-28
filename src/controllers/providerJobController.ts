import { Request, Response, NextFunction } from 'express';
import {
  acceptAssignedJob,
  rejectAssignedJob,
  updateJobProgress,
} from '../services/serviceRequestService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../types';
import { ServiceProvider } from '../models';

/**
 * Provider accepts assigned job
 * PATCH /api/service-requests/:id/accept
 * Access: Service Provider only (assigned provider)
 */
export const acceptJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.user!.id;

    // Get provider ID from user ID
    const provider = await ServiceProvider.findOne({ userId });
    if (!provider) {
      sendErrorResponse(res, 'Service provider profile not found', HttpStatus.NOT_FOUND);
      return;
    }

    const serviceRequest = await acceptAssignedJob(id, provider._id.toString());

    sendSuccessResponse(
      res,
      'Job accepted successfully',
      serviceRequest,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept job';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Only the assigned') || message.includes('No service provider')
      ? HttpStatus.FORBIDDEN
      : message.includes('Can only accept')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Provider rejects assigned job
 * PATCH /api/service-requests/:id/reject
 * Access: Service Provider only (assigned provider)
 */
export const rejectJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.user!.id;
    const { rejectionReason } = req.body;

    // Get provider ID from user ID
    const provider = await ServiceProvider.findOne({ userId });
    if (!provider) {
      sendErrorResponse(res, 'Service provider profile not found', HttpStatus.NOT_FOUND);
      return;
    }

    const serviceRequest = await rejectAssignedJob(
      id,
      provider._id.toString(),
      rejectionReason
    );

    sendSuccessResponse(
      res,
      'Job rejected successfully',
      serviceRequest,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject job';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Only the assigned') || message.includes('No service provider')
      ? HttpStatus.FORBIDDEN
      : message.includes('Can only reject')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Provider updates job progress
 * PATCH /api/service-requests/:id/progress
 * Access: Service Provider only (assigned provider)
 */
export const updateProgressController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.user!.id;

    // Get provider ID from user ID
    const provider = await ServiceProvider.findOne({ userId });
    if (!provider) {
      sendErrorResponse(res, 'Service provider profile not found', HttpStatus.NOT_FOUND);
      return;
    }

    const serviceRequest = await updateJobProgress(
      id,
      provider._id.toString(),
      req.body
    );

    sendSuccessResponse(
      res,
      'Job progress updated successfully',
      serviceRequest,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update job progress';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Only the assigned') || message.includes('No service provider')
      ? HttpStatus.FORBIDDEN
      : message.includes('Invalid status transition') || message.includes('Cost must be')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};