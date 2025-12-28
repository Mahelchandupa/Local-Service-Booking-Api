import { Types } from 'mongoose';
import { Payment, ServiceRequest, Customer, ServiceProvider } from '../models';
import { IPayment } from '../types';

export interface CreatePaymentDto {
  serviceRequestId: string;
  amount: number;
  paymentMethod?: 'cash' | 'card' | 'online';
}

export interface PaymentFilters {
  customerId?: string;
  serviceProviderId?: string;
  status?: 'pending' | 'completed';
  page?: number;
  limit?: number;
}

/**
 * Create a new payment record
 */
export const createPayment = async (
  dto: CreatePaymentDto,
  createdBy: 'customer' | 'admin',
  userId?: string
): Promise<IPayment> => {
  const { serviceRequestId, amount, paymentMethod } = dto;

  // Validate service request exists
  if (!Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error('Invalid service request ID');
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  // Only COMPLETED service requests can have payments
  if (serviceRequest.status !== 'completed') {
    throw new Error('Payment can only be created for completed service requests');
  }

  // If created by customer, verify ownership
  if (createdBy === 'customer' && userId) {
    const customer = await Customer.findOne({ userId });
    if (!customer) {
      throw new Error('Customer profile not found');
    }
    if (customer._id.toString() !== serviceRequest.customerId.toString()) {
      throw new Error('Not authorized to create payment for this service request');
    }
  }

  // Check if payment already exists for this service request
  const existingPayment = await Payment.findOne({ serviceRequestId });
  if (existingPayment) {
    throw new Error('Payment record already exists for this service request');
  }

  // Validate amount is positive
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  // Get service provider from service request
  if (!serviceRequest.serviceProviderId) {
    throw new Error('Service request has no assigned provider');
  }

  // Create payment
  const payment = await Payment.create({
    serviceRequestId,
    customerId: serviceRequest.customerId,
    serviceProviderId: serviceRequest.serviceProviderId,
    amount,
    status: 'pending',
    paymentMethod,
  });

  return payment;
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (id: string): Promise<IPayment | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid payment ID');
  }

  const payment = await Payment.findById(id)
    .populate('serviceRequestId', 'description status preferredDate')
    .populate('customerId', 'name')
    .populate('serviceProviderId', 'name rating');

  return payment;
};

/**
 * Get payments with filters
 */
export const getPayments = async (
  filters: PaymentFilters
): Promise<{
  payments: IPayment[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { customerId, serviceProviderId, status, page = 1, limit = 10 } = filters;

  // Build query
  const query: any = {};
  
  if (customerId) {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new Error('Invalid customer ID');
    }
    query.customerId = customerId;
  }
  
  if (serviceProviderId) {
    if (!Types.ObjectId.isValid(serviceProviderId)) {
      throw new Error('Invalid service provider ID');
    }
    query.serviceProviderId = serviceProviderId;
  }
  
  if (status) {
    if (!['pending', 'completed'].includes(status)) {
      throw new Error('Invalid status. Must be pending or completed');
    }
    query.status = status;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('serviceRequestId', 'description status preferredDate')
      .populate('customerId', 'name')
      .populate('serviceProviderId', 'name rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(query),
  ]);

  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Mark payment as paid (Admin only)
 */
export const markPaymentAsPaid = async (id: string): Promise<IPayment> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid payment ID');
  }

  const payment = await Payment.findById(id);
  if (!payment) {
    throw new Error('Payment not found');
  }

  // Check if already marked as completed
  if (payment.status === 'completed') {
    throw new Error('Payment is already marked as completed');
  }

  // Update status and timestamp
  payment.status = 'completed';
  payment.markedCompletedAt = new Date();

  await payment.save();

  return payment;
};