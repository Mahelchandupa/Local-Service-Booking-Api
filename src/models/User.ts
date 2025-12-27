import { Schema, model } from 'mongoose';
import { IUser } from '../types';
import { baseSchemaOptions } from './BaseModel';

const userSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      sparse: true, // Allows multiple null values but enforces uniqueness for non-null values
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['customer', 'service_provider', 'admin'],
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  baseSchemaOptions
);

// Indexes
userSchema.index({ phoneNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const User = model<IUser>('User', userSchema);

