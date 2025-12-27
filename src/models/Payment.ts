import { Schema, model } from 'mongoose';
import { IPayment } from '../types';
import { baseSchemaOptions } from './BaseModel';

const paymentSchema = new Schema<IPayment>(
  {
    serviceRequestId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'ServiceRequest',
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
      index: true,
    },
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ServiceProvider',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
    },
    markedCompletedAt: {
      type: Date,
    },
  },
  baseSchemaOptions
);

// Indexes
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ serviceProviderId: 1 });

// Compound index
paymentSchema.index({ serviceProviderId: 1, status: 1 });

export const Payment = model<IPayment>('Payment', paymentSchema);

