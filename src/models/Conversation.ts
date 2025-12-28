import { Schema, model } from 'mongoose';
import { IConversation, IMessage } from '../types';
import { baseSchemaOptions } from './BaseModel';

/**
 * Message Schema (embedded in Conversation)
 */
const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    senderRole: {
      type: String,
      required: true,
      enum: ['customer', 'service_provider'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true } // Each message gets its own _id
);

/**
 * Conversation Schema
 */
const conversationSchema = new Schema<IConversation>(
  {
    serviceRequestId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'ServiceRequest',
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  baseSchemaOptions
);

// Indexes for efficient queries
conversationSchema.index({ serviceRequestId: 1 });
conversationSchema.index({ customerId: 1, lastMessageAt: -1 });
conversationSchema.index({ serviceProviderId: 1, lastMessageAt: -1 });
conversationSchema.index({ lastMessageAt: -1 });

// Update lastMessageAt before saving
conversationSchema.pre('save', function (next) {
  if (this.messages && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMessage.timestamp;
  }
  next();
});

export const Conversation = model<IConversation>('Conversation', conversationSchema);