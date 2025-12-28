import { EventEmitter } from 'events';

/**
 * Domain Event Emitter
 * Centralized event bus for application-wide events
 */
class DomainEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners to prevent warnings in complex flows
    this.setMaxListeners(20);
  }
}

// Singleton instance
export const eventEmitter = new DomainEventEmitter();

/**
 * Domain Event Types
 */
export enum DomainEvents {
  // Service Request Events
  PROVIDER_ASSIGNED = 'provider.assigned',
  JOB_ACCEPTED = 'job.accepted',
  JOB_COMPLETED = 'job.completed',
  
  // Payment Events
  PAYMENT_MARKED_PAID = 'payment.marked.paid',
  
  // Rating Events
  RATING_RECEIVED = 'rating.received',
}

/**
 * Event Payload Interfaces
 */
export interface ProviderAssignedEvent {
  serviceRequestId: string;
  customerId: string;
  serviceProviderId: string;
  assignedBy: string;
}

export interface JobAcceptedEvent {
  serviceRequestId: string;
  customerId: string;
  serviceProviderId: string;
}

export interface JobCompletedEvent {
  serviceRequestId: string;
  customerId: string;
  serviceProviderId: string;
  cost?: number;
}

export interface PaymentMarkedPaidEvent {
  paymentId: string;
  serviceRequestId: string;
  customerId: string;
  serviceProviderId: string;
  amount: number;
}

export interface RatingReceivedEvent {
  ratingId: string;
  serviceRequestId: string;
  customerId: string;
  serviceProviderId: string;
  rating: number;
}