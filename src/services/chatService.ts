import { Types } from 'mongoose';
import { Conversation } from '../models/Conversation';
import { ServiceRequest, User } from '../models';
import { IConversation, IMessage } from '../types';

/**
 * Get or create conversation for a service request
 */
export const getOrCreateConversation = async (
  serviceRequestId: string,
  userId: string
): Promise<IConversation> => {
  if (!Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error('Invalid service request ID');
  }

  // Get service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  // Verify user is part of this conversation (customer or assigned provider)
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isCustomer = serviceRequest.customerId.toString() === userId;
  const isProvider = serviceRequest.serviceProviderId?.toString() === userId;

  if (!isCustomer && !isProvider) {
    throw new Error('Not authorized to access this conversation');
  }

  // Provider must be assigned
  if (!serviceRequest.serviceProviderId) {
    throw new Error('No provider assigned to this service request');
  }

  // Get or create conversation
  let conversation = await Conversation.findOne({ serviceRequestId });

  if (!conversation) {
    conversation = await Conversation.create({
      serviceRequestId,
      customerId: serviceRequest.customerId,
      serviceProviderId: serviceRequest.serviceProviderId,
      messages: [],
      lastMessageAt: new Date(),
    });
  }

  return conversation;
};

/**
 * Get conversation by service request ID
 */
export const getConversationByServiceRequest = async (
  serviceRequestId: string,
  userId: string
): Promise<IConversation | null> => {
  if (!Types.ObjectId.isValid(serviceRequestId)) {
    throw new Error('Invalid service request ID');
  }

  const conversation = await Conversation.findOne({ serviceRequestId })
    .populate('customerId', 'phoneNumber email')
    .populate('serviceProviderId', 'phoneNumber email')
    .populate('serviceRequestId', 'description status');

  if (!conversation) {
    return null;
  }

  // Verify user is part of this conversation
  const isCustomer = conversation.customerId.toString() === userId;
  const isProvider = conversation.serviceProviderId.toString() === userId;

  if (!isCustomer && !isProvider) {
    throw new Error('Not authorized to access this conversation');
  }

  return conversation;
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: string,
  userId: string,
  limit: number = 50,
  before?: Date
): Promise<{
  messages: IMessage[];
  hasMore: boolean;
}> => {
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Verify user is part of this conversation
  const isCustomer = conversation.customerId.toString() === userId;
  const isProvider = conversation.serviceProviderId.toString() === userId;

  if (!isCustomer && !isProvider) {
    throw new Error('Not authorized to access this conversation');
  }

  // Filter messages
  let messages = conversation.messages;

  if (before) {
    messages = messages.filter((msg) => msg.timestamp < before);
  }

  // Sort by timestamp (newest first) and limit
  const sortedMessages = messages
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);

  // Check if there are more messages
  const hasMore = messages.length > limit;

  // Reverse to show oldest first
  return {
    messages: sortedMessages.reverse(),
    hasMore,
  };
};

/**
 * Add message to conversation (called by socket handler)
 */
export const addMessage = async (
  conversationId: string,
  senderId: string,
  message: string
): Promise<IMessage> => {
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Verify sender is part of this conversation
  const isCustomer = conversation.customerId.toString() === senderId;
  const isProvider = conversation.serviceProviderId.toString() === senderId;

  if (!isCustomer && !isProvider) {
    throw new Error('Not authorized to send messages in this conversation');
  }

  // Determine sender role
  const senderRole = isCustomer ? 'customer' : 'service_provider';

  // Create message
  const newMessage: IMessage = {
    _id: new Types.ObjectId(),
    senderId: new Types.ObjectId(senderId),
    senderRole,
    message: message.trim(),
    timestamp: new Date(),
    isRead: false,
  };

  // Add to conversation
  conversation.messages.push(newMessage);
  await conversation.save();

  return newMessage;
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<number> => {
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Verify user is part of this conversation
  const isCustomer = conversation.customerId.toString() === userId;
  const isProvider = conversation.serviceProviderId.toString() === userId;

  if (!isCustomer && !isProvider) {
    throw new Error('Not authorized to access this conversation');
  }

  // Mark all messages from the other party as read
  let markedCount = 0;
  conversation.messages.forEach((msg) => {
    if (msg.senderId.toString() !== userId && !msg.isRead) {
      msg.isRead = true;
      markedCount++;
    }
  });

  if (markedCount > 0) {
    await conversation.save();
  }

  return markedCount;
};