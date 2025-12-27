import { Document, Schema } from 'mongoose';

/**
 * Base interface for all models
 * Extend this interface when creating new models
 */
export interface IBaseModel extends Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base schema options
 * Include these options in your schemas to add timestamps
 */
export const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    transform: function (doc: any, ret: any) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

