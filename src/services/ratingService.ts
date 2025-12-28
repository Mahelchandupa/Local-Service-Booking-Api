import { Types } from 'mongoose';
import { Rating, ServiceRequest, Payment, Customer, ServiceProvider } from '../models';
import { IRating } from '../types';

export interface CreateRatingDto {
  serviceRequestId: string;
  rating: number;
  feedback?: string;
}

/**
 * Create a new rating
 */
export const createRating = async (
  dto: CreateRatingDto,
  customerId: string
): Promise<IRating> => {
  const { serviceRequestId, rating, feedback } = dto;

  // Validate service request exists
  if (!Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error('Invalid service request ID');
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  // Verify service request is COMPLETED
  if (serviceRequest.status !== 'completed') {
    throw new Error('Can only rate completed service requests');
  }

  // Verify customer owns this service request
  if (serviceRequest.customerId.toString() !== customerId) {
    throw new Error('Not authorized to rate this service request');
  }

  // Verify service provider is assigned
  if (!serviceRequest.serviceProviderId) {
    throw new Error('Service request has no assigned provider');
  }

  // Verify payment exists and is completed
  const payment = await Payment.findOne({ serviceRequestId });
  if (!payment) {
    throw new Error('Payment record not found for this service request');
  }
  if (payment.status !== 'completed') {
    throw new Error('Can only rate service requests with completed payments');
  }

  // Check if rating already exists for this service request
  const existingRating = await Rating.findOne({ serviceRequestId });
  if (existingRating) {
    throw new Error('Rating already exists for this service request');
  }

  // Validate rating value (1-5)
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Create rating
  const newRating = await Rating.create({
    serviceRequestId,
    customerId,
    serviceProviderId: serviceRequest.serviceProviderId,
    rating,
    feedback,
  });

  // Update service provider's rating statistics
  await updateProviderRating(serviceRequest.serviceProviderId.toString());

  return newRating;
};

/**
 * Get ratings for a service provider
 */
export const getRatingsByProvider = async (
  providerId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  ratings: IRating[];
  total: number;
  page: number;
  totalPages: number;
  averageRating: number;
  totalRatings: number;
}> => {
  if (!Types.ObjectId.isValid(providerId)) {
    throw new Error('Invalid provider ID');
  }

  // Verify provider exists
  const provider = await ServiceProvider.findById(providerId);
  if (!provider) {
    throw new Error('Service provider not found');
  }

  // Build query
  const query = { serviceProviderId: providerId };

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [ratings, total] = await Promise.all([
    Rating.find(query)
      .populate('customerId', 'name')
      .populate('serviceRequestId', 'description categoryId preferredDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Rating.countDocuments(query),
  ]);

  return {
    ratings,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    averageRating: provider.rating,
    totalRatings: provider.totalRatings,
  };
};

/**
 * Get rating for a specific service request
 */
export const getRatingByServiceRequest = async (
  serviceRequestId: string
): Promise<IRating | null> => {
  if (!Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error('Invalid service request ID');
  }

  const rating = await Rating.findOne({ serviceRequestId })
    .populate('customerId', 'name')
    .populate('serviceProviderId', 'name rating')
    .populate('serviceRequestId', 'description status');

  return rating;
};

/**
 * Update service provider's average rating and total count
 * Called after a new rating is created
 */
const updateProviderRating = async (providerId: string): Promise<void> => {
  // Calculate average rating from all ratings for this provider
  const result = await Rating.aggregate([
    {
      $match: { serviceProviderId: new Types.ObjectId(providerId) },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    const { averageRating, totalRatings } = result[0];
    
    await ServiceProvider.findByIdAndUpdate(providerId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings,
    });
  }
};