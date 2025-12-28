/**
 * @swagger
 * tags:
 *   name: Service Requests
 *   description: Service request management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - fullAddress
 *         - coordinates
 *       properties:
 *         fullAddress:
 *           type: string
 *           description: Full address of the service location
 *           example: "123 Main Street, Colombo, Western Province"
 *         coordinates:
 *           type: object
 *           required:
 *             - lat
 *             - lng
 *           properties:
 *             lat:
 *               type: number
 *               format: float
 *               minimum: -90
 *               maximum: 90
 *               description: Latitude
 *               example: 6.9271
 *             lng:
 *               type: number
 *               format: float
 *               minimum: -180
 *               maximum: 180
 *               description: Longitude
 *               example: 79.8612
 *     
 *     CreateServiceRequestRequest:
 *       type: object
 *       required:
 *         - categoryId
 *         - description
 *         - preferredDate
 *         - location
 *       properties:
 *         categoryId:
 *           type: string
 *           description: Service category ID
 *           example: "507f1f77bcf86cd799439011"
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           description: Service description
 *           example: "Need to fix electrical wiring in living room"
 *         preferredDate:
 *           type: string
 *           format: date-time
 *           description: Preferred service date
 *           example: "2025-01-15T10:00:00Z"
 *         preferredTime:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Preferred time in HH:MM format
 *           example: "14:30"
 *         location:
 *           $ref: '#/components/schemas/Location'
 *     
 *     UpdateStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [accepted, on_the_way, in_progress, completed, cancelled]
 *           description: New status for the service request
 *           example: "in_progress"
 *         cancellationReason:
 *           type: string
 *           minLength: 5
 *           maxLength: 500
 *           description: Reason for cancellation (required when status is cancelled)
 *           example: "Customer unavailable"
 *         cost:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Service cost (can be set when completing)
 *           example: 5000
 *     
 *     AssignProviderRequest:
 *       type: object
 *       required:
 *         - serviceProviderId
 *       properties:
 *         serviceProviderId:
 *           type: string
 *           description: Service provider ID to assign
 *           example: "507f1f77bcf86cd799439012"
 *     
 *     ServiceRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Service request ID
 *           example: "507f1f77bcf86cd799439013"
 *         customerId:
 *           type: object
 *           description: Customer information
 *           properties:
 *             id:
 *               type: string
 *               example: "507f1f77bcf86cd799439014"
 *             name:
 *               type: string
 *               example: "John Doe"
 *         serviceProviderId:
 *           type: object
 *           description: Service provider information (if assigned)
 *           properties:
 *             id:
 *               type: string
 *               example: "507f1f77bcf86cd799439015"
 *             name:
 *               type: string
 *               example: "Jane Smith"
 *             rating:
 *               type: number
 *               example: 4.5
 *         categoryId:
 *           type: object
 *           description: Service category information
 *           properties:
 *             id:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             name:
 *               type: string
 *               example: "Electrician"
 *             description:
 *               type: string
 *               example: "Electrical services"
 *             icon:
 *               type: string
 *               example: "electrical-icon-url"
 *         description:
 *           type: string
 *           example: "Need to fix electrical wiring in living room"
 *         preferredDate:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:00:00Z"
 *         preferredTime:
 *           type: string
 *           example: "14:30"
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         status:
 *           type: string
 *           enum: [requested, accepted, on_the_way, in_progress, completed, cancelled]
 *           example: "requested"
 *         cost:
 *           type: number
 *           example: 5000
 *         cancelledBy:
 *           type: string
 *           enum: [customer, service_provider, admin]
 *           example: "customer"
 *         cancellationReason:
 *           type: string
 *           example: "Changed my mind"
 *         assignedBy:
 *           type: string
 *           enum: [system, admin, provider]
 *           example: "provider"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-10T08:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-10T09:00:00Z"
 *     
 *     ServiceRequestsList:
 *       type: object
 *       properties:
 *         serviceRequests:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ServiceRequest'
 *         total:
 *           type: integer
 *           description: Total number of service requests
 *           example: 25
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 3
 */

/**
 * @swagger
 * /api/service-requests:
 *   post:
 *     tags:
 *       - Service Requests
 *     summary: Create a new service request
 *     description: Customers can create a new service request for a specific category
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceRequestRequest'
 *           example:
 *             categoryId: "507f1f77bcf86cd799439011"
 *             description: "Need to fix electrical wiring in living room and install new outlets"
 *             preferredDate: "2025-01-15T10:00:00Z"
 *             preferredTime: "14:30"
 *             location:
 *               fullAddress: "123 Main Street, Colombo, Western Province"
 *               coordinates:
 *                 lat: 6.9271
 *                 lng: 79.8612
 *     responses:
 *       201:
 *         description: Service request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceRequest'
 *             example:
 *               success: true
 *               message: "Service request created successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439013"
 *                 customerId: "507f1f77bcf86cd799439014"
 *                 categoryId: "507f1f77bcf86cd799439011"
 *                 description: "Need to fix electrical wiring in living room"
 *                 preferredDate: "2025-01-15T10:00:00Z"
 *                 preferredTime: "14:30"
 *                 location:
 *                   fullAddress: "123 Main Street, Colombo"
 *                   coordinates:
 *                     lat: 6.9271
 *                     lng: 79.8612
 *                 status: "requested"
 *                 createdAt: "2025-01-10T08:00:00Z"
 *                 updatedAt: "2025-01-10T08:00:00Z"
 *               statusCode: 201
 *       400:
 *         description: Validation error or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only customers can create service requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Customer profile or service category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/service-requests/{id}:
 *   get:
 *     tags:
 *       - Service Requests
 *     summary: Get service request by ID
 *     description: Retrieve details of a specific service request. Customers can view their own requests, providers can view assigned requests, admins can view all.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Service request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceRequest'
 *             example:
 *               success: true
 *               message: "Service request retrieved successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439013"
 *                 customerId:
 *                   id: "507f1f77bcf86cd799439014"
 *                   name: "John Doe"
 *                 serviceProviderId:
 *                   id: "507f1f77bcf86cd799439015"
 *                   name: "Jane Smith"
 *                   rating: 4.5
 *                 categoryId:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "Electrician"
 *                 description: "Need to fix electrical wiring"
 *                 status: "in_progress"
 *                 cost: 5000
 *               statusCode: 200
 *       400:
 *         description: Invalid service request ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Not authorized to access this service request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Service request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/service-requests:
 *   get:
 *     tags:
 *       - Service Requests
 *     summary: Get service requests with filters
 *     description: Retrieve service requests filtered by role. Customers see their requests, providers see assigned requests, admins see all.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [requested, accepted, on_the_way, in_progress, completed, cancelled]
 *         description: Filter by status
 *         example: "in_progress"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Service requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceRequestsList'
 *             example:
 *               success: true
 *               message: "Service requests retrieved successfully"
 *               data:
 *                 serviceRequests:
 *                   - id: "507f1f77bcf86cd799439013"
 *                     customerId:
 *                       id: "507f1f77bcf86cd799439014"
 *                       name: "John Doe"
 *                     status: "in_progress"
 *                 total: 25
 *                 page: 1
 *                 totalPages: 3
 *               statusCode: 200
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/service-requests/{id}/status:
 *   patch:
 *     tags:
 *       - Service Requests
 *     summary: Update service request status
 *     description: |
 *       Update the status of a service request with role-based permissions:
 *       - **Customers**: Can only cancel their own requests
 *       - **Service Providers**: Can accept unassigned requests and update status of assigned requests
 *       - **Admins**: Can perform any status update
 *       
 *       Valid status transitions:
 *       - requested → accepted, cancelled
 *       - accepted → on_the_way, cancelled
 *       - on_the_way → in_progress, cancelled
 *       - in_progress → completed, cancelled
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *           examples:
 *             acceptRequest:
 *               summary: Provider accepts request
 *               value:
 *                 status: "accepted"
 *             startWork:
 *               summary: Provider starts work
 *               value:
 *                 status: "in_progress"
 *             completeWithCost:
 *               summary: Complete service with cost
 *               value:
 *                 status: "completed"
 *                 cost: 5000
 *             cancelRequest:
 *               summary: Cancel with reason
 *               value:
 *                 status: "cancelled"
 *                 cancellationReason: "Customer unavailable"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceRequest'
 *             example:
 *               success: true
 *               message: "Service request status updated successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439013"
 *                 status: "completed"
 *                 cost: 5000
 *               statusCode: 200
 *       400:
 *         description: Invalid status transition or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Not authorized to update this request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Service request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/service-requests/{id}/assign:
 *   patch:
 *     tags:
 *       - Service Requests
 *     summary: Assign service provider to request
 *     description: Admin can manually assign a verified service provider to a requested service
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignProviderRequest'
 *           example:
 *             serviceProviderId: "507f1f77bcf86cd799439015"
 *     responses:
 *       200:
 *         description: Service provider assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceRequest'
 *             example:
 *               success: true
 *               message: "Service provider assigned successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439013"
 *                 serviceProviderId: "507f1f77bcf86cd799439015"
 *                 status: "accepted"
 *                 assignedBy: "admin"
 *               statusCode: 200
 *       400:
 *         description: Invalid data or service provider not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Service request or provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * tags:
 *   name: Provider Job Management
 *   description: Service provider job acceptance and progress management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RejectJobRequest:
 *       type: object
 *       properties:
 *         rejectionReason:
 *           type: string
 *           minLength: 5
 *           maxLength: 500
 *           description: Reason for rejecting the job (optional)
 *           example: "Schedule conflict, unable to take this job"
 *     
 *     UpdateProgressRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [on_the_way, in_progress, completed]
 *           description: Next status in the job progress flow
 *           example: "in_progress"
 *         cost:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Service cost (required when status is completed)
 *           example: 5000
 */

/**
 * @swagger
 * /api/service-requests/{id}/accept:
 *   patch:
 *     tags:
 *       - Provider Job Management
 *     summary: Provider accepts assigned job
 *     description: |
 *       Service provider accepts a job that was assigned to them by admin.
 *       
 *       **Requirements:**
 *       - Service request must be in ASSIGNED status
 *       - Only the assigned provider can accept
 *       
 *       **Status Transition:**
 *       - ASSIGNED → ACCEPTED
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Job accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceRequest'
 *             example:
 *               success: true
 *               message: "Job accepted successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439013"
 *                 status: "accepted"
 *                 serviceProviderId:
 *                   id: "507f1f77bcf86cd799439015"
 *                   name: "Jane Smith"
 *                 assignedBy: "admin"
 *               statusCode: 200
 *       400:
 *         description: Invalid status - can only accept jobs in ASSIGNED status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Can only accept service requests in assigned status"
 *               statusCode: 400
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only assigned provider can accept
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Only the assigned service provider can accept this request"
 *               statusCode: 403
 *       404:
 *         description: Service request or provider profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/service-requests/{id}/reject:
 *   patch:
 *     tags:
 *       - Provider Job Management
 *     summary: Provider rejects assigned job
 *     description: |
 *       Service provider rejects a job that was assigned to them by admin.
 *       
 *       **Requirements:**
 *       - Service request must be in ASSIGNED status
 *       - Only the assigned provider can reject
 *       
 *       **Status Transition:**
 *       - ASSIGNED → REJECTED
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectJobRequest'
 *           example:
 *             rejectionReason: "Schedule conflict, unable to take this job"
 *     responses:
 *       200:
 *         description: Job rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceRequest'
 *             example:
 *               success: true
 *               message: "Job rejected successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439013"
 *                 status: "rejected"
 *                 cancelledBy: "service_provider"
 *                 cancellationReason: "Schedule conflict, unable to take this job"
 *               statusCode: 200
 *       400:
 *         description: Invalid status - can only reject jobs in ASSIGNED status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Can only reject service requests in assigned status"
 *               statusCode: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only assigned provider can reject
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Service request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/service-requests/{id}/progress:
 *   patch:
 *     tags:
 *       - Provider Job Management
 *     summary: Provider updates job progress
 *     description: |
 *       Service provider updates the progress status of their assigned job.
 *       
 *       **Requirements:**
 *       - Only the assigned provider can update progress
 *       - Must follow valid status transitions
 *       
 *       **Valid Status Transitions:**
 *       - ACCEPTED → ON_THE_WAY
 *       - ON_THE_WAY → IN_PROGRESS
 *       - IN_PROGRESS → COMPLETED
 *       
 *       **Cost Requirement:**
 *       - Cost should be provided when completing the job (status = completed)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProgressRequest'
 *           examples:
 *             onTheWay:
 *               summary: Provider is on the way
 *               value:
 *                 status: "on_the_way"
 *             inProgress:
 *               summary: Work started
 *               value:
 *                 status: "in_progress"
 *             completed:
 *               summary: Job completed with cost
 *               value:
 *                 status: "completed"
 *                 cost: 5000
 *     responses:
 *       200:
 *         description: Job progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ServiceRequest'
 *             example:
 *               success: true
 *               message: "Job progress updated successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439013"
 *                 status: "completed"
 *                 cost: 5000
 *               statusCode: 200
 *       400:
 *         description: Invalid status transition or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidTransition:
 *                 summary: Invalid status transition
 *                 value:
 *                   success: false
 *                   message: "Invalid status transition from 'requested' to 'in_progress'. Valid transitions: none"
 *                   statusCode: 400
 *               invalidCost:
 *                 summary: Invalid cost value
 *                 value:
 *                   success: false
 *                   message: "Cost must be a positive number"
 *                   statusCode: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only assigned provider can update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Only the assigned service provider can update progress"
 *               statusCode: 403
 *       404:
 *         description: Service request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */