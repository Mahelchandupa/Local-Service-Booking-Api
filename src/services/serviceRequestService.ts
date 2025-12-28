import { Types } from 'mongoose';
import { ServiceRequest, Customer, ServiceProvider, ServiceCategory } from '../models';
import { IServiceRequest } from '../types';

export interface CreateServiceRequestDto {
  customerId: string;
  categoryId: string;
  description: string;
  preferredDate: Date;
  preferredTime?: string;
  location: {
    fullAddress: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export interface UpdateStatusDto {
  status: 'accepted' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';
  cancellationReason?: string;
  cost?: number;
}

export interface ProviderProgressDto {
  status: 'on_the_way' | 'in_progress' | 'completed';
  cost?: number;
}

// Status transition rules
// Note: Admin assignment creates ASSIGNED status (internally stored as 'accepted' with assignedBy='admin')
const statusTransitions: Record<string, string[]> = {
  requested: ['cancelled'],
  assigned: ['accepted', 'rejected', 'cancelled'], // After admin assignment
  accepted: ['on_the_way', 'cancelled'],
  on_the_way: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  rejected: [],
};

/**
 * Create a new service request
 */
export const createServiceRequest = async (
  dto: CreateServiceRequestDto
): Promise<IServiceRequest> => {
  // Verify customer exists
  const customer = await Customer.findById(dto.customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  // Verify category exists and is active
  const category = await ServiceCategory.findById(dto.categoryId);
  if (!category) {
    throw new Error('Service category not found');
  }
  if (!category.isActive) {
    throw new Error('Service category is not active');
  }

  // Validate preferred date is in the future
  const now = new Date();
  if (new Date(dto.preferredDate) < now) {
    throw new Error('Preferred date must be in the future');
  }

  // Create service request
  const serviceRequest = await ServiceRequest.create({
    customerId: dto.customerId,
    categoryId: dto.categoryId,
    description: dto.description,
    preferredDate: dto.preferredDate,
    preferredTime: dto.preferredTime,
    location: dto.location,
    status: 'requested',
  });

  return serviceRequest;
};

/**
 * Get service request by ID
 */
export const getServiceRequestById = async (
  id: string
): Promise<IServiceRequest | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid service request ID');
  }

  const serviceRequest = await ServiceRequest.findById(id)
    .populate('customerId', 'name')
    .populate('serviceProviderId', 'name rating')
    .populate('categoryId', 'name description icon');

  return serviceRequest;
};

/**
 * Get service requests with filters
 */
export const getServiceRequests = async (filters: {
  customerId?: string;
  serviceProviderId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  serviceRequests: IServiceRequest[];
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
    if (!['requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      throw new Error('Invalid status');
    }
    query.status = status;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [serviceRequests, total] = await Promise.all([
    ServiceRequest.find(query)
      .populate('customerId', 'name')
      .populate('serviceProviderId', 'name rating')
      .populate('categoryId', 'name description icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ServiceRequest.countDocuments(query),
  ]);

  return {
    serviceRequests,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Update service request status
 */
export const updateServiceRequestStatus = async (
  id: string,
  dto: UpdateStatusDto,
  userRole: 'customer' | 'service_provider' | 'admin',
  userId: string
): Promise<IServiceRequest> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid service request ID');
  }

  const serviceRequest = await ServiceRequest.findById(id);
  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  // Check if status transition is valid
  const currentStatus = serviceRequest.status;
  const newStatus = dto.status;

  if (!statusTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(
      `Cannot transition from '${currentStatus}' to '${newStatus}'`
    );
  }

  // Role-based status update rules
  if (userRole === 'customer') {
    // Customer can only cancel their own requests
    const customer = await Customer.findOne({ userId });
    if (!customer || customer._id.toString() !== serviceRequest.customerId.toString()) {
      throw new Error('Not authorized to update this service request');
    }

    if (newStatus !== 'cancelled') {
      throw new Error('Customers can only cancel service requests');
    }

    serviceRequest.status = 'cancelled';
    serviceRequest.cancelledBy = 'customer';
    serviceRequest.cancellationReason = dto.cancellationReason;
  } else if (userRole === 'service_provider') {
    // Provider can only update their assigned requests
    const provider = await ServiceProvider.findOne({ userId });
    if (!provider) {
      throw new Error('Service provider not found');
    }

    // For accepting a request, provider must not be assigned yet
    if (newStatus === 'accepted' && !serviceRequest.serviceProviderId) {
      serviceRequest.serviceProviderId = provider._id;
      serviceRequest.assignedBy = 'provider';
      serviceRequest.status = 'accepted';
    } else {
      // For other status updates, verify provider is assigned
      if (!serviceRequest.serviceProviderId || 
          serviceRequest.serviceProviderId.toString() !== provider._id.toString()) {
        throw new Error('Not authorized to update this service request');
      }

      if (newStatus === 'cancelled') {
        serviceRequest.status = 'cancelled';
        serviceRequest.cancelledBy = 'service_provider';
        serviceRequest.cancellationReason = dto.cancellationReason;
      } else {
        serviceRequest.status = newStatus;
      }

      // Update cost if provided and status is completed
      if (newStatus === 'completed' && dto.cost !== undefined) {
        serviceRequest.cost = dto.cost;
      }
    }
  } else if (userRole === 'admin') {
    // Admin can do anything
    serviceRequest.status = newStatus;
    
    if (newStatus === 'cancelled') {
      serviceRequest.cancelledBy = 'admin';
      serviceRequest.cancellationReason = dto.cancellationReason;
    }

    if (dto.cost !== undefined) {
      serviceRequest.cost = dto.cost;
    }
  }

  await serviceRequest.save();
  return serviceRequest;
};

/**
 * Assign service provider to request (Admin only)
 */
export const assignServiceProvider = async (
  serviceRequestId: string,
  serviceProviderId: string
): Promise<IServiceRequest> => {
  if (!Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error('Invalid service request ID');
  }
  if (!Types.ObjectId.isValid(serviceProviderId)) {
    throw new Error('Invalid service provider ID');
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  if (serviceRequest.status !== 'requested') {
    throw new Error('Can only assign service provider to requested services');
  }

  const provider = await ServiceProvider.findById(serviceProviderId);
  if (!provider) {
    throw new Error('Service provider not found');
  }

  if (!provider.isVerified) {
    throw new Error('Service provider is not verified');
  }

  serviceRequest.serviceProviderId = provider._id;
  serviceRequest.assignedBy = 'admin';
  // Set status to 'assigned' - provider must accept or reject
  serviceRequest.status = 'assigned' as any;

  await serviceRequest.save();
  return serviceRequest;
};

/**
 * Provider accepts assigned job
 */
export const acceptAssignedJob = async (
  serviceRequestId: string,
  providerId: string
): Promise<IServiceRequest> => {
  if (!Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error('Invalid service request ID');
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  // Verify request is in ASSIGNED status
  if (serviceRequest.status !== 'assigned' as any) {
    throw new Error('Can only accept service requests in assigned status');
  }

  // Verify provider is the assigned provider
  if (!serviceRequest.serviceProviderId) {
    throw new Error('No service provider assigned to this request');
  }

  if (serviceRequest.serviceProviderId.toString() !== providerId) {
    throw new Error('Only the assigned service provider can accept this request');
  }

  // Update status to ACCEPTED
  serviceRequest.status = 'accepted';
  await serviceRequest.save();

  return serviceRequest;
};

/**
 * Provider rejects assigned job
 */
export const rejectAssignedJob = async (
  serviceRequestId: string,
  providerId: string,
  rejectionReason?: string
): Promise<IServiceRequest> => {
  if (!Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error('Invalid service request ID');
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  // Verify request is in ASSIGNED status
  if (serviceRequest.status !== 'assigned' as any) {
    throw new Error('Can only reject service requests in assigned status');
  }

  // Verify provider is the assigned provider
  if (!serviceRequest.serviceProviderId) {
    throw new Error('No service provider assigned to this request');
  }

  if (serviceRequest.serviceProviderId.toString() !== providerId) {
    throw new Error('Only the assigned service provider can reject this request');
  }

  // Update status to REJECTED
  serviceRequest.status = 'rejected' as any;
  serviceRequest.cancellationReason = rejectionReason || 'Rejected by service provider';
  serviceRequest.cancelledBy = 'service_provider';

  await serviceRequest.save();

  return serviceRequest;
};

/**
 * Provider updates job progress
 * Valid transitions: ACCEPTED → ON_THE_WAY → IN_PROGRESS → COMPLETED
 */
export const updateJobProgress = async (
  serviceRequestId: string,
  providerId: string,
  dto: ProviderProgressDto
): Promise<IServiceRequest> => {
  if (!Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error('Invalid service request ID');
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  // Verify provider is the assigned provider
  if (!serviceRequest.serviceProviderId) {
    throw new Error('No service provider assigned to this request');
  }

  if (serviceRequest.serviceProviderId.toString() !== providerId) {
    throw new Error('Only the assigned service provider can update progress');
  }

  // Validate status transition
  const currentStatus = serviceRequest.status;
  const newStatus = dto.status;

  const validTransitions: Record<string, string[]> = {
    accepted: ['on_the_way'],
    on_the_way: ['in_progress'],
    in_progress: ['completed'],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from '${currentStatus}' to '${newStatus}'. Valid transitions: ${validTransitions[currentStatus]?.join(', ') || 'none'}`
    );
  }

  // Update status
  serviceRequest.status = newStatus;

  // Update cost if completing and cost is provided
  if (newStatus === 'completed' && dto.cost !== undefined) {
    if (dto.cost < 0) {
      throw new Error('Cost must be a positive number');
    }
    serviceRequest.cost = dto.cost;
  }

  await serviceRequest.save();

  return serviceRequest;
};