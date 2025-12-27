import { Schema, model } from 'mongoose';
import { IServiceCategory } from '../types';
import { baseSchemaOptions } from './BaseModel';

const serviceCategorySchema = new Schema<IServiceCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  baseSchemaOptions
);

export const ServiceCategory = model<IServiceCategory>(
  'ServiceCategory',
  serviceCategorySchema
);

