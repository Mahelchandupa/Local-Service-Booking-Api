import { Schema, model } from 'mongoose';
import { IServiceProvider, IAvailability, ICoverageArea } from '../types';
import { baseSchemaOptions } from './BaseModel';

const availabilitySchema = new Schema<IAvailability>(
  {
    days: {
      type: [String],
      required: true,
    },
    timeSlots: [
      {
        start: {
          type: String,
          required: true,
        },
        end: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { _id: false }
);

const coverageAreaSchema = new Schema<ICoverageArea>(
  {
    city: {
      type: String,
      required: true,
    },
    radius: {
      type: Number,
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

const serviceProviderSchema = new Schema<IServiceProvider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    serviceCategories: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ServiceCategory',
      },
    ],
    availability: {
      type: availabilitySchema,
    },
    coverageArea: {
      type: coverageAreaSchema,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  baseSchemaOptions
);

// Indexes
serviceProviderSchema.index({ userId: 1 });
serviceProviderSchema.index({ isVerified: 1 });
serviceProviderSchema.index({ serviceCategories: 1 });

export const ServiceProvider = model<IServiceProvider>(
  'ServiceProvider',
  serviceProviderSchema
);

