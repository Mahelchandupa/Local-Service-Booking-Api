import { Schema, model } from 'mongoose';
import { INotification } from '../types';
import { baseSchemaOptions } from './BaseModel';

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['service_request', 'status_update', 'payment', 'system'],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      // e.g., ServiceRequest ID
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  baseSchemaOptions
);

// Indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: 1 });

// Compound index
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>(
  'Notification',
  notificationSchema
);

