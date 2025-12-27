Entities & Fields

User

_id: ObjectId, required, unique, primary key
phoneNumber: String, required, unique, indexed
email: String, optional, unique, indexed
passwordHash: String, required
role: String, required, enum: ['customer', 'service_provider', 'admin']
isVerified: Boolean, required, default: false
isActive: Boolean, required, default: true
createdAt: Date, required, default: Date.now
updatedAt: Date, required, default: Date.now

Customer

_id: ObjectId, required, unique, primary key
userId: ObjectId, required, unique, ref: 'User'
name: String, required
addresses: Array of Address objects, optional

label: String (e.g., 'Home', 'Office')
fullAddress: String
coordinates: Object { lat: Number, lng: Number }


createdAt: Date, required, default: Date.now
updatedAt: Date, required, default: Date.now

ServiceProvider

_id: ObjectId, required, unique, primary key
userId: ObjectId, required, unique, ref: 'User'
name: String, required
skills: Array of String, required (e.g., ['electrician', 'plumber'])
serviceCategories: Array of ObjectId, required, ref: 'ServiceCategory'
availability: Object, optional

days: Array of String (e.g., ['monday', 'tuesday'])
timeSlots: Array of Object { start: String, end: String }


coverageArea: Object, optional

city: String
radius: Number (in km)
coordinates: Object { lat: Number, lng: Number }


isVerified: Boolean, required, default: false
rating: Number, optional, default: 0, min: 0, max: 5
totalRatings: Number, optional, default: 0
totalEarnings: Number, optional, default: 0
createdAt: Date, required, default: Date.now
updatedAt: Date, required, default: Date.now

ServiceCategory

_id: ObjectId, required, unique, primary key
name: String, required, unique (e.g., 'Electrician', 'Plumber')
description: String, optional
icon: String, optional (URL or identifier)
isActive: Boolean, required, default: true
createdAt: Date, required, default: Date.now
updatedAt: Date, required, default: Date.now

ServiceRequest

_id: ObjectId, required, unique, primary key
customerId: ObjectId, required, ref: 'Customer', indexed
serviceProviderId: ObjectId, optional, ref: 'ServiceProvider', indexed
categoryId: ObjectId, required, ref: 'ServiceCategory'
description: String, required
preferredDate: Date, required
preferredTime: String, optional
location: Object, required

fullAddress: String
coordinates: Object { lat: Number, lng: Number }


status: String, required, enum: ['requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'], default: 'requested', indexed
cost: Number, optional
cancelledBy: String, optional, enum: ['customer', 'service_provider', 'admin']
cancellationReason: String, optional
assignedBy: String, optional, enum: ['system', 'admin', 'provider']
createdAt: Date, required, default: Date.now, indexed
updatedAt: Date, required, default: Date.now

Payment

_id: ObjectId, required, unique, primary key
serviceRequestId: ObjectId, required, unique, ref: 'ServiceRequest'
customerId: ObjectId, required, ref: 'Customer', indexed
serviceProviderId: ObjectId, required, ref: 'ServiceProvider', indexed
amount: Number, required
status: String, required, enum: ['pending', 'completed'], default: 'pending'
paymentMethod: String, optional, enum: ['cash', 'card', 'online']
markedCompletedAt: Date, optional
createdAt: Date, required, default: Date.now
updatedAt: Date, required, default: Date.now

Rating

_id: ObjectId, required, unique, primary key
serviceRequestId: ObjectId, required, unique, ref: 'ServiceRequest'
customerId: ObjectId, required, ref: 'Customer', indexed
serviceProviderId: ObjectId, required, ref: 'ServiceProvider', indexed
rating: Number, required, min: 1, max: 5
feedback: String, optional
createdAt: Date, required, default: Date.now
updatedAt: Date, required, default: Date.now

Notification

_id: ObjectId, required, unique, primary key
userId: ObjectId, required, ref: 'User', indexed
title: String, required
message: String, required
type: String, required, enum: ['service_request', 'status_update', 'payment', 'system']
referenceId: ObjectId, optional (e.g., ServiceRequest ID)
isRead: Boolean, required, default: false
createdAt: Date, required, default: Date.now, indexed

Chat

_id: ObjectId, required, unique, primary key
serviceRequestId: ObjectId, required, ref: 'ServiceRequest', indexed
customerId: ObjectId, required, ref: 'Customer'
serviceProviderId: ObjectId, required, ref: 'ServiceProvider'
messages: Array of Message objects

senderId: ObjectId, required
senderRole: String, required, enum: ['customer', 'service_provider']
message: String, required
timestamp: Date, required
isRead: Boolean, default: false


createdAt: Date, required, default: Date.now
updatedAt: Date, required, default: Date.now


Relationships

User → Customer (one-to-one): Each user with role 'customer' has one customer profile
User → ServiceProvider (one-to-one): Each user with role 'service_provider' has one service provider profile
ServiceProvider → ServiceCategory (many-to-many): Service providers can offer multiple service categories
Customer → ServiceRequest (one-to-many): Customers can create multiple service requests
ServiceProvider → ServiceRequest (one-to-many): Service providers can handle multiple service requests
ServiceCategory → ServiceRequest (one-to-many): Each service request belongs to one category
ServiceRequest → Payment (one-to-one): Each service request has one payment record
ServiceRequest → Rating (one-to-one): Each service request can have one rating
ServiceRequest → Chat (one-to-one): Each service request has one chat thread
Customer → Payment (one-to-many): Customers have multiple payment records
ServiceProvider → Payment (one-to-many): Service providers have multiple payment records
Customer → Rating (one-to-many): Customers can give multiple ratings
ServiceProvider → Rating (one-to-many): Service providers receive multiple ratings
User → Notification (one-to-many): Users receive multiple notifications


Index

User.phoneNumber: Unique login/registration lookup
User.email: Unique login lookup
User.role: Filter users by role
ServiceRequest.customerId: Query customer's service requests
ServiceRequest.serviceProviderId: Query provider's jobs
ServiceRequest.status: Filter by status (common operation)
ServiceRequest.createdAt: Sort by creation date, date range queries
ServiceProvider.userId: Link to user account
ServiceProvider.isVerified: Filter verified providers
ServiceProvider.serviceCategories: Filter providers by category
Customer.userId: Link to user account
Payment.customerId: Customer payment history
Payment.serviceProviderId: Provider earnings queries
Rating.serviceProviderId: Calculate provider ratings
Notification.userId: User-specific notifications
Notification.isRead: Filter unread notifications
Notification.createdAt: Sort notifications by date
Chat.serviceRequestId: Retrieve chat for a service request

Compound Indexes

ServiceRequest: {customerId: 1, createdAt: -1} - Customer's recent requests
ServiceRequest: {serviceProviderId: 1, status: 1} - Provider's active jobs
Notification: {userId: 1, isRead: 1, createdAt: -1} - Unread notifications for user
Payment: {serviceProviderId: 1, status: 1} - Provider's completed payments