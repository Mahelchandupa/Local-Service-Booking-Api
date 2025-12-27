import { Schema, model } from 'mongoose';
import { IChat, IMessage } from '../types';
import { baseSchemaOptions } from './BaseModel';

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    senderRole: {
      type: String,
      required: true,
      enum: ['customer', 'service_provider'],
    },
    message: {
      type: String,
      required: true,
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
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    serviceRequestId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ServiceRequest',
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ServiceProvider',
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  baseSchemaOptions
);

// Indexes
chatSchema.index({ serviceRequestId: 1 });

export const Chat = model<IChat>('Chat', chatSchema);

