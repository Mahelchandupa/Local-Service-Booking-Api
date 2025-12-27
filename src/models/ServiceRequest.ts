import { Schema, model } from 'mongoose';
import { IServiceRequest, ILocation } from '../types';
import { baseSchemaOptions } from './BaseModel';

const locationSchema = new Schema<ILocation>(
  {
    fullAddress: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
  },
  { _id: false }
);

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
      index: true,
    },
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ServiceCategory',
    },
    description: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
      default: 'requested',
      index: true,
    },
    cost: {
      type: Number,
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'service_provider', 'admin'],
    },
    cancellationReason: {
      type: String,
    },
    assignedBy: {
      type: String,
      enum: ['system', 'admin', 'provider'],
    },
  },
  baseSchemaOptions
);

// Indexes
serviceRequestSchema.index({ customerId: 1 });
serviceRequestSchema.index({ serviceProviderId: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ createdAt: 1 });

// Compound indexes
serviceRequestSchema.index({ customerId: 1, createdAt: -1 });
serviceRequestSchema.index({ serviceProviderId: 1, status: 1 });

export const ServiceRequest = model<IServiceRequest>(
  'ServiceRequest',
  serviceRequestSchema
);

