import { Schema, model } from 'mongoose';
import { ICustomer, IAddress } from '../types';
import { baseSchemaOptions } from './BaseModel';

const addressSchema = new Schema<IAddress>(
  {
    label: {
      type: String,
      required: true,
    },
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

const customerSchema = new Schema<ICustomer>(
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
    addresses: {
      type: [addressSchema],
      default: [],
    },
  },
  baseSchemaOptions
);

// Indexes
customerSchema.index({ userId: 1 });

export const Customer = model<ICustomer>('Customer', customerSchema);

