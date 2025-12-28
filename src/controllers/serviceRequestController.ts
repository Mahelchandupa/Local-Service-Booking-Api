import { Request, Response, NextFunction } from 'express';
import {
  createServiceRequest,
  getServiceRequestById,
  getServiceRequests,
  updateServiceRequestStatus,
  assignServiceProvider,
} from '../services/serviceRequestService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../types';
import { Customer, ServiceProvider } from '../models';

/**
 * Create a new service request
 * POST /api/service-requests
 * Access: Customer only
 */
export const createServiceRequestController = async (
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

    const serviceRequest = await createServiceRequest({
      ...req.body,
      customerId: customer._id.toString(),
    });

    sendSuccessResponse(
      res,
      'Service request created successfully',
      serviceRequest,
      HttpStatus.CREATED
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create service request';
    const statusCode = message.includes('not found') || message.includes('not active')
      ? HttpStatus.NOT_FOUND
      : message.includes('must be in the future')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Get service request by ID
 * GET /api/service-requests/:id
 * Access: Owner (customer/provider) or Admin
 */
export const getServiceRequestByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.user!.id;
    const userRole = authReq.user!.role;

    const serviceRequest = await getServiceRequestById(id);
    if (!serviceRequest) {
      sendErrorResponse(res, 'Service request not found', HttpStatus.NOT_FOUND);
      return;
    }

    // Authorization check (unless admin)
    if (userRole !== 'admin') {
      if (userRole === 'customer') {
        const customer = await Customer.findOne({ userId });
        if (!customer || customer._id.toString() !== serviceRequest.customerId.toString()) {
          sendErrorResponse(
            res,
            'You do not have permission to access this service request',
            HttpStatus.FORBIDDEN
          );
          return;
        }
      } else if (userRole === 'service_provider') {
        const provider = await ServiceProvider.findOne({ userId });
        if (
          !provider ||
          !serviceRequest.serviceProviderId ||
          provider._id.toString() !== serviceRequest.serviceProviderId.toString()
        ) {
          sendErrorResponse(
            res,
            'You do not have permission to access this service request',
            HttpStatus.FORBIDDEN
          );
          return;
        }
      }
    }

    sendSuccessResponse(
      res,
      'Service request retrieved successfully',
      serviceRequest,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve service request';
    const statusCode = message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Get service requests with filters
 * GET /api/service-requests
 * Access: Authenticated (filtered by role)
 */
export const getServiceRequestsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    const userRole = authReq.user!.role;

    const { status, page, limit } = req.query;

    // Build filters based on role
    const filters: any = {
      status: status as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    };

    if (userRole === 'customer') {
      const customer = await Customer.findOne({ userId });
      if (!customer) {
        sendErrorResponse(res, 'Customer profile not found', HttpStatus.NOT_FOUND);
        return;
      }
      filters.customerId = customer._id.toString();
    } else if (userRole === 'service_provider') {
      const provider = await ServiceProvider.findOne({ userId });
      if (!provider) {
        sendErrorResponse(res, 'Service provider profile not found', HttpStatus.NOT_FOUND);
        return;
      }
      filters.serviceProviderId = provider._id.toString();
    }
    // Admin can see all requests (no additional filter)

    const result = await getServiceRequests(filters);

    sendSuccessResponse(
      res,
      'Service requests retrieved successfully',
      result,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve service requests';
    const statusCode = message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Update service request status
 * PATCH /api/service-requests/:id/status
 * Access: Customer (cancel), Provider (progress), Admin (override)
 */
export const updateServiceRequestStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.user!.id;
    const userRole = authReq.user!.role;

    const serviceRequest = await updateServiceRequestStatus(
      id,
      req.body,
      userRole,
      userId
    );

    sendSuccessResponse(
      res,
      'Service request status updated successfully',
      serviceRequest,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update service request status';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Not authorized') || message.includes('can only')
      ? HttpStatus.FORBIDDEN
      : message.includes('Invalid') || message.includes('Cannot transition')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Assign service provider to request
 * PATCH /api/service-requests/:id/assign
 * Access: Admin only
 */
export const assignServiceProviderController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { serviceProviderId } = req.body;

    if (!serviceProviderId) {
      sendErrorResponse(res, 'Service provider ID is required', HttpStatus.BAD_REQUEST);
      return;
    }

    const serviceRequest = await assignServiceProvider(id, serviceProviderId);

    sendSuccessResponse(
      res,
      'Service provider assigned successfully',
      serviceRequest,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to assign service provider';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('not verified') || message.includes('Can only assign')
      ? HttpStatus.BAD_REQUEST
      : message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};