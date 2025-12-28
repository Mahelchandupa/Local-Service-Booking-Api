/**
 * TypeScript interfaces for all entities
 */

import { Document, Types } from 'mongoose';

// ==================== User ====================
export interface IUser extends Document {
  _id: Types.ObjectId;
  phoneNumber: string;
  email?: string;
  passwordHash: string;
  role: 'customer' | 'service_provider' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Address ====================
export interface IAddress {
  label: string; // e.g., 'Home', 'Office'
  fullAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// ==================== Customer ====================
export interface ICustomer extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  addresses?: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Availability ====================
export interface IAvailability {
  days: string[]; // e.g., ['monday', 'tuesday']
  timeSlots: Array<{
    start: string;
    end: string;
  }>;
}

// ==================== CoverageArea ====================
export interface ICoverageArea {
  city: string;
  radius: number; // in km
  coordinates: {
    lat: number;
    lng: number;
  };
}

// ==================== ServiceProvider ====================
export interface IServiceProvider extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  skills: string[]; // e.g., ['electrician', 'plumber']
  serviceCategories: Types.ObjectId[];
  availability?: IAvailability;
  coverageArea?: ICoverageArea;
  isVerified: boolean;
  rating: number;
  totalRatings: number;
  totalEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== ServiceCategory ====================
export interface IServiceCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  icon?: string; // URL or identifier
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Location ====================
export interface ILocation {
  fullAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// ==================== ServiceRequest ====================
export interface IServiceRequest extends Document {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  serviceProviderId?: Types.ObjectId;
  categoryId: Types.ObjectId;
  description: string;
  preferredDate: Date;
  preferredTime?: string;
  location: ILocation;
  status: 'requested' | 'accepted' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';
  cost?: number;
  cancelledBy?: 'customer' | 'service_provider' | 'admin';
  cancellationReason?: string;
  assignedBy?: 'system' | 'admin' | 'provider';
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Payment ====================
export interface IPayment extends Document {
  _id: Types.ObjectId;
  serviceRequestId: Types.ObjectId;
  customerId: Types.ObjectId;
  serviceProviderId: Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed';
  paymentMethod?: 'cash' | 'card' | 'online';
  markedCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Rating ====================
export interface IRating extends Document {
  _id: Types.ObjectId;
  serviceRequestId: Types.ObjectId;
  customerId: Types.ObjectId;
  serviceProviderId: Types.ObjectId;
  rating: number; // 1-5
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Notification ====================
export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: 'service_request' | 'status_update' | 'payment' | 'system';
  referenceId?: Types.ObjectId; // e.g., ServiceRequest ID
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Message ====================
export interface IMessage {
  _id?: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: 'customer' | 'service_provider';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// ==================== Chat ====================
export interface IConversation extends Document {
  _id: Types.ObjectId;
  serviceRequestId: Types.ObjectId;
  customerId: Types.ObjectId;
  serviceProviderId: Types.ObjectId;
  messages: IMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Request Types ====================
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'customer' | 'service_provider' | 'admin';
  };
}
