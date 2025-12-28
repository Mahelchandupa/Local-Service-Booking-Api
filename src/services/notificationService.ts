import { Types } from 'mongoose';
import { Notification } from '../models';
import { INotification } from '../types';
import {
  eventEmitter,
  DomainEvents,
  ProviderAssignedEvent,
  JobAcceptedEvent,
  JobCompletedEvent,
  PaymentMarkedPaidEvent,
  RatingReceivedEvent,
} from '../utils/eventEmitter';
import { emitNotificationToUser, emitUnreadCountToUser } from '../utils/socket';

/**
 * Create a notification
 */
const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type: 'service_request' | 'status_update' | 'payment' | 'system';
  referenceId?: string;
}): Promise<INotification> => {
  const notification = await Notification.create({
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    referenceId: data.referenceId ? new Types.ObjectId(data.referenceId) : undefined,
    isRead: false,
  });

  // Emit real-time notification via Socket.IO
  emitNotificationToUser(data.userId, {
    id: notification._id.toString(),
    title: notification.title,
    message: notification.message,
    type: notification.type,
    referenceId: notification.referenceId?.toString(),
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });

  // Update unread count
  const unreadCount = await Notification.countDocuments({
    userId: data.userId,
    isRead: false,
  });
  emitUnreadCountToUser(data.userId, unreadCount);

  return notification;
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
  isRead?: boolean
): Promise<{
  notifications: INotification[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  // Build query
  const query: any = { userId };
  if (isRead !== undefined) {
    query.isRead = isRead;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    unreadCount,
  };
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<INotification> => {
  if (!Types.ObjectId.isValid(notificationId)) {
    throw new Error('Invalid notification ID');
  }

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error('Notification not found');
  }

  // Verify user owns this notification
  if (notification.userId.toString() !== userId) {
    throw new Error('Not authorized to update this notification');
  }

  // Check if already read
  if (notification.isRead) {
    return notification;
  }

  notification.isRead = true;
  await notification.save();

  // Update unread count via Socket.IO
  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });
  emitUnreadCountToUser(userId, unreadCount);

  return notification;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<{ modifiedCount: number }> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  // Update unread count via Socket.IO (should be 0 now)
  emitUnreadCountToUser(userId, 0);

  return { modifiedCount: result.modifiedCount || 0 };
};

// ==================== Event Handlers ====================

/**
 * Handle provider assigned event
 */
const handleProviderAssigned = async (event: ProviderAssignedEvent) => {
  try {
    // Notify customer
    await createNotification({
      userId: event.customerId,
      title: 'Service Provider Assigned',
      message: 'A service provider has been assigned to your service request.',
      type: 'service_request',
      referenceId: event.serviceRequestId,
    });

    // Notify provider
    await createNotification({
      userId: event.serviceProviderId,
      title: 'New Job Assignment',
      message: 'You have been assigned to a new service request. Please accept or reject.',
      type: 'service_request',
      referenceId: event.serviceRequestId,
    });
  } catch (error) {
    console.error('Error handling provider assigned event:', error);
  }
};

/**
 * Handle job accepted event
 */
const handleJobAccepted = async (event: JobAcceptedEvent) => {
  try {
    // Notify customer
    await createNotification({
      userId: event.customerId,
      title: 'Service Provider Accepted',
      message: 'Your service provider has accepted the job and will be in touch soon.',
      type: 'status_update',
      referenceId: event.serviceRequestId,
    });
  } catch (error) {
    console.error('Error handling job accepted event:', error);
  }
};

/**
 * Handle job completed event
 */
const handleJobCompleted = async (event: JobCompletedEvent) => {
  try {
    // Notify customer
    const costMessage = event.cost 
      ? ` The service cost is ${event.cost}.`
      : '';
    
    await createNotification({
      userId: event.customerId,
      title: 'Service Completed',
      message: `Your service request has been completed.${costMessage} Please proceed with payment.`,
      type: 'status_update',
      referenceId: event.serviceRequestId,
    });

    // Notify provider
    await createNotification({
      userId: event.serviceProviderId,
      title: 'Job Completed',
      message: 'You have marked the job as completed. Waiting for payment confirmation.',
      type: 'status_update',
      referenceId: event.serviceRequestId,
    });
  } catch (error) {
    console.error('Error handling job completed event:', error);
  }
};

/**
 * Handle payment marked paid event
 */
const handlePaymentMarkedPaid = async (event: PaymentMarkedPaidEvent) => {
  try {
    // Notify customer
    await createNotification({
      userId: event.customerId,
      title: 'Payment Confirmed',
      message: `Your payment of ${event.amount} has been confirmed.`,
      type: 'payment',
      referenceId: event.serviceRequestId,
    });

    // Notify provider
    await createNotification({
      userId: event.serviceProviderId,
      title: 'Payment Received',
      message: `Payment of ${event.amount} has been confirmed for your completed service.`,
      type: 'payment',
      referenceId: event.serviceRequestId,
    });
  } catch (error) {
    console.error('Error handling payment marked paid event:', error);
  }
};

/**
 * Handle rating received event
 */
const handleRatingReceived = async (event: RatingReceivedEvent) => {
  try {
    // Notify provider
    const stars = '⭐'.repeat(event.rating);
    await createNotification({
      userId: event.serviceProviderId,
      title: 'New Rating Received',
      message: `You received a ${event.rating}-star rating ${stars} for your service.`,
      type: 'system',
      referenceId: event.serviceRequestId,
    });
  } catch (error) {
    console.error('Error handling rating received event:', error);
  }
};

/**
 * Initialize notification event listeners
 * Call this once when the application starts
 */
export const initializeNotificationListeners = () => {
  // Register event handlers
  eventEmitter.on(DomainEvents.PROVIDER_ASSIGNED, handleProviderAssigned);
  eventEmitter.on(DomainEvents.JOB_ACCEPTED, handleJobAccepted);
  eventEmitter.on(DomainEvents.JOB_COMPLETED, handleJobCompleted);
  eventEmitter.on(DomainEvents.PAYMENT_MARKED_PAID, handlePaymentMarkedPaid);
  eventEmitter.on(DomainEvents.RATING_RECEIVED, handleRatingReceived);

  console.log('✅ Notification event listeners initialized');
};