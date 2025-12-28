import { Request, Response, NextFunction } from 'express';
import {
  createPayment,
  getPaymentById,
  getPayments,
  markPaymentAsPaid,
} from '../services/paymentService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../types';
import { Customer, ServiceProvider } from '../models';

/**
 * Create a new payment record
 * POST /api/payments
 * Access: Customer or Admin
 */
export const createPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    const userRole = authReq.user!.role;

    const payment = await createPayment(
      req.body,
      userRole === 'admin' ? 'admin' : 'customer',
      userId
    );

    sendSuccessResponse(
      res,
      'Payment record created successfully',
      payment,
      HttpStatus.CREATED
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create payment';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Not authorized') || message.includes('already exists')
      ? HttpStatus.FORBIDDEN
      : message.includes('Invalid') || message.includes('only be created') || message.includes('must be greater')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Get payment by ID
 * GET /api/payments/:id
 * Access: Owner (customer/provider) or Admin
 */
export const getPaymentByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const userId = authReq.user!.id;
    const userRole = authReq.user!.role;

    const payment = await getPaymentById(id);
    if (!payment) {
      sendErrorResponse(res, 'Payment not found', HttpStatus.NOT_FOUND);
      return;
    }

    // Authorization check (unless admin)
    if (userRole !== 'admin') {
      if (userRole === 'customer') {
        const customer = await Customer.findOne({ userId });
        if (!customer || customer._id.toString() !== payment.customerId.toString()) {
          sendErrorResponse(
            res,
            'You do not have permission to access this payment',
            HttpStatus.FORBIDDEN
          );
          return;
        }
      } else if (userRole === 'service_provider') {
        const provider = await ServiceProvider.findOne({ userId });
        if (!provider || provider._id.toString() !== payment.serviceProviderId.toString()) {
          sendErrorResponse(
            res,
            'You do not have permission to access this payment',
            HttpStatus.FORBIDDEN
          );
          return;
        }
      }
    }

    sendSuccessResponse(
      res,
      'Payment retrieved successfully',
      payment,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve payment';
    const statusCode = message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Get payments with filters
 * GET /api/payments
 * Access: Authenticated (filtered by role)
 */
export const getPaymentsController = async (
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
    // Admin can see all payments (no additional filter)

    const result = await getPayments(filters);

    sendSuccessResponse(
      res,
      'Payments retrieved successfully',
      result,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve payments';
    const statusCode = message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Mark payment as paid
 * PATCH /api/payments/:id/mark-paid
 * Access: Admin only
 */
export const markPaymentAsPaidController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await markPaymentAsPaid(id);

    sendSuccessResponse(
      res,
      'Payment marked as completed successfully',
      payment,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark payment as paid';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Invalid') || message.includes('already marked')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};