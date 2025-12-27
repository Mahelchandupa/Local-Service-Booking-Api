import { Schema, model } from 'mongoose';
import { IRating } from '../types';
import { baseSchemaOptions } from './BaseModel';

const ratingSchema = new Schema<IRating>(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
    },
  },
  baseSchemaOptions
);

// Indexes
ratingSchema.index({ customerId: 1 });
ratingSchema.index({ serviceProviderId: 1 });

export const Rating = model<IRating>('Rating', ratingSchema);

