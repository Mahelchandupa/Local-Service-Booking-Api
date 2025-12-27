# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the **Local Service Booking Mobile Application**. The document is intended to serve as a reference for stakeholders including business owners, business analysts, designers, developers, testers, and project managers.

### 1.2 Scope
The Local Service Booking Mobile Application is a medium-scale system designed to connect customers with local service providers such as electricians, plumbers, cleaners, and technicians. The application will allow customers to request services, service providers to manage jobs, and administrators to monitor and manage operations.

The system will initially support a single city and focus on core service booking, tracking, and management features.

### 1.3 Definitions, Acronyms, and Abbreviations
- **App**: Mobile Application
- **BA**: Business Analyst
- **SRS**: Software Requirements Specification
- **OTP**: One-Time Password
- **RBAC**: Role-Based Access Control

### 1.4 References
- IEEE 830 / IEEE 29148 – Software Requirements Specification Standards

### 1.5 Overview
This document provides a detailed description of system users, functional requirements, non-functional requirements, constraints, assumptions, and system behavior.

---

## 2. Overall Description

### 2.1 Product Perspective
The application will be a new standalone product consisting of:
- A mobile application for Customers and Service Providers
- A backend system providing APIs
- An admin interface (web or internal tool)

The backend will handle authentication, data storage, business logic, and notifications.

### 2.2 Product Functions
High-level functions include:
- User registration and authentication
- Service request creation and management
- Job assignment and tracking
- Communication between users
- Payment record management
- Administrative monitoring and reporting

### 2.3 User Classes and Characteristics

#### 2.3.1 Customer
- Non-technical users
- Use mobile app to request services
- Expect quick response and transparency

#### 2.3.2 Service Provider
- Skilled workers providing services
- Use mobile app to accept and manage jobs
- Require job and earnings visibility

#### 2.3.3 Admin
- Internal staff
- Manage users, services, and system operations
- Access reports and dashboards

### 2.4 Operating Environment
- Mobile OS: Android (initial release)
- Backend: API-based system
- Internet connectivity required

### 2.5 Design and Implementation Constraints
- Single-city operation
- English language only
- Manual or offline payment handling
- Medium-scale user base (~1,000 active users)

### 2.6 Assumptions and Dependencies
- Users possess smartphones
- Service providers are manually verified
- Payment gateways may be integrated later

---

## 3. Functional Requirements

### 3.1 User Authentication and Authorization

#### 3.1.1 Registration
- The system shall allow users to register using a mobile number or email.
- The system shall verify users using OTP.
- The system shall assign a role (Customer, Service Provider, Admin) to each user.

#### 3.1.2 Login & Logout
- The system shall allow registered users to log in.
- The system shall allow users to log out securely.

---

### 3.2 Customer Functional Requirements

#### 3.2.1 Service Request Creation
- Customers shall be able to select a service category.
- Customers shall be able to enter a service description.
- Customers shall be able to select preferred date and time.
- Customers shall be able to provide service location.

#### 3.2.2 Service Tracking
- Customers shall be able to view service request status.
- The system shall notify customers of status changes.

#### 3.2.3 Communication
- Customers shall be able to communicate with the assigned service provider via in-app chat or call.

#### 3.2.4 Payments
- Customers shall be able to view service cost details.
- Customers shall be able to mark payment as completed.
- The system shall store payment history.

#### 3.2.5 Ratings & History
- Customers shall be able to view past service requests.
- Customers shall be able to rate service providers.
- Customers shall be able to leave feedback comments.

---

### 3.3 Service Provider Functional Requirements

#### 3.3.1 Profile Management
- Service providers shall create and update their profiles.
- Profiles shall include skills, availability, and service areas.

#### 3.3.2 Job Management
- Service providers shall view incoming job requests.
- Service providers shall accept or reject service requests.
- Service providers shall update job status.

#### 3.3.3 Earnings Management
- Service providers shall view completed jobs.
- Service providers shall view total earnings summary.

---

### 3.4 Admin Functional Requirements

#### 3.4.1 User Management
- Admins shall view all users.
- Admins shall activate or deactivate user accounts.
- Admins shall verify service providers.

#### 3.4.2 Service Monitoring
- Admins shall view all service requests.
- Admins shall assign service providers manually.
- Admins shall override service statuses if required.

#### 3.4.3 Reports & Analytics
- Admins shall view daily and monthly service reports.
- Admins shall view revenue summaries.
- Admins shall view popular service categories.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- The system shall support at least 1,000 concurrent users.
- API response time should be within acceptable limits.

### 4.2 Security
- User data shall be securely stored.
- Role-based access control shall be implemented.
- Authentication data shall be encrypted.

### 4.3 Usability
- The application shall be easy to use for non-technical users.
- The UI shall be intuitive and responsive.

### 4.4 Reliability & Availability
- The system shall be available 24/7 except during maintenance.

### 4.5 Scalability
- The system should allow future expansion to additional cities.

---

## 5. External Interface Requirements

### 5.1 User Interfaces
- Mobile UI for Customers and Service Providers
- Web or internal UI for Admins

### 5.2 Software Interfaces
- Backend APIs for mobile applications
- Notification services for alerts

---

## 6. Future Enhancements (Out of Scope)

- Online payment gateway integration
- Multi-language support
- Advanced analytics and AI-based recommendations
- Multi-city support

---

## 7. Approval

This document serves as the baseline for system design and development. Any changes must follow the defined change management process.

---

**End of Document**

