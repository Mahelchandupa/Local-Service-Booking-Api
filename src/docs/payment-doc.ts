/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment record management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - serviceRequestId
 *         - amount
 *       properties:
 *         serviceRequestId:
 *           type: string
 *           description: Service request ID (must be in COMPLETED status)
 *           example: "507f1f77bcf86cd799439013"
 *         amount:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           description: Payment amount (must be greater than zero)
 *           example: 5000
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, online]
 *           description: Payment method (optional)
 *           example: "cash"
 *     
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Payment ID
 *           example: "507f1f77bcf86cd799439020"
 *         serviceRequestId:
 *           type: object
 *           description: Service request information
 *           properties:
 *             id:
 *               type: string
 *               example: "507f1f77bcf86cd799439013"
 *             description:
 *               type: string
 *               example: "Fix electrical wiring"
 *             status:
 *               type: string
 *               example: "completed"
 *             preferredDate:
 *               type: string
 *               format: date-time
 *               example: "2025-01-15T10:00:00Z"
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
 *           description: Service provider information
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
 *         amount:
 *           type: number
 *           format: float
 *           example: 5000
 *         status:
 *           type: string
 *           enum: [pending, completed]
 *           example: "pending"
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, online]
 *           example: "cash"
 *         markedCompletedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when payment was marked as completed
 *           example: "2025-01-16T14:30:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T15:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-16T14:30:00Z"
 *     
 *     PaymentsList:
 *       type: object
 *       properties:
 *         payments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Payment'
 *         total:
 *           type: integer
 *           description: Total number of payments
 *           example: 15
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 2
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create a new payment record
 *     description: |
 *       Create a payment record for a completed service request.
 *       
 *       **Requirements:**
 *       - Service request must be in COMPLETED status
 *       - Payment record must not already exist for this service request
 *       - Amount must be greater than zero
 *       - Customers can only create payments for their own service requests
 *       - Admins can create payments for any service request
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *           examples:
 *             cashPayment:
 *               summary: Cash payment
 *               value:
 *                 serviceRequestId: "507f1f77bcf86cd799439013"
 *                 amount: 5000
 *                 paymentMethod: "cash"
 *             cardPayment:
 *               summary: Card payment
 *               value:
 *                 serviceRequestId: "507f1f77bcf86cd799439013"
 *                 amount: 7500
 *                 paymentMethod: "card"
 *             noMethod:
 *               summary: Payment without method specified
 *               value:
 *                 serviceRequestId: "507f1f77bcf86cd799439013"
 *                 amount: 5000
 *     responses:
 *       201:
 *         description: Payment record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Payment'
 *             example:
 *               success: true
 *               message: "Payment record created successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439020"
 *                 serviceRequestId: "507f1f77bcf86cd799439013"
 *                 customerId: "507f1f77bcf86cd799439014"
 *                 serviceProviderId: "507f1f77bcf86cd799439015"
 *                 amount: 5000
 *                 status: "pending"
 *                 paymentMethod: "cash"
 *                 createdAt: "2025-01-15T15:00:00Z"
 *               statusCode: 201
 *       400:
 *         description: Validation error or business rule violation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notCompleted:
 *                 summary: Service request not completed
 *                 value:
 *                   success: false
 *                   message: "Payment can only be created for completed service requests"
 *                   statusCode: 400
 *               invalidAmount:
 *                 summary: Invalid amount
 *                 value:
 *                   success: false
 *                   message: "Payment amount must be greater than zero"
 *                   statusCode: 400
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Payment already exists or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyExists:
 *                 summary: Payment already exists
 *                 value:
 *                   success: false
 *                   message: "Payment record already exists for this service request"
 *                   statusCode: 403
 *               notAuthorized:
 *                 summary: Not authorized
 *                 value:
 *                   success: false
 *                   message: "Not authorized to create payment for this service request"
 *                   statusCode: 403
 *       404:
 *         description: Service request or customer profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment by ID
 *     description: |
 *       Retrieve details of a specific payment record.
 *       
 *       **Access Control:**
 *       - Customers can view payments for their service requests
 *       - Providers can view payments for their completed jobs
 *       - Admins can view all payments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *         example: "507f1f77bcf86cd799439020"
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Payment'
 *             example:
 *               success: true
 *               message: "Payment retrieved successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439020"
 *                 serviceRequestId:
 *                   id: "507f1f77bcf86cd799439013"
 *                   description: "Fix electrical wiring"
 *                   status: "completed"
 *                 customerId:
 *                   id: "507f1f77bcf86cd799439014"
 *                   name: "John Doe"
 *                 serviceProviderId:
 *                   id: "507f1f77bcf86cd799439015"
 *                   name: "Jane Smith"
 *                   rating: 4.5
 *                 amount: 5000
 *                 status: "pending"
 *                 paymentMethod: "cash"
 *               statusCode: 200
 *       400:
 *         description: Invalid payment ID
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
 *         description: Forbidden - Not authorized to access this payment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "You do not have permission to access this payment"
 *               statusCode: 403
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payments with filters
 *     description: |
 *       Retrieve payments filtered by role.
 *       
 *       **Filtering by Role:**
 *       - Customers see payments for their service requests
 *       - Providers see payments for their completed jobs
 *       - Admins see all payments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed]
 *         description: Filter by payment status
 *         example: "pending"
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
 *         description: Payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaymentsList'
 *             example:
 *               success: true
 *               message: "Payments retrieved successfully"
 *               data:
 *                 payments:
 *                   - id: "507f1f77bcf86cd799439020"
 *                     serviceRequestId:
 *                       id: "507f1f77bcf86cd799439013"
 *                       description: "Fix electrical wiring"
 *                     amount: 5000
 *                     status: "pending"
 *                 total: 15
 *                 page: 1
 *                 totalPages: 2
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
 *       404:
 *         description: Customer or provider profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/{id}/mark-paid:
 *   patch:
 *     tags:
 *       - Payments
 *     summary: Mark payment as paid
 *     description: |
 *       Admin marks a payment record as completed.
 *       
 *       **Requirements:**
 *       - Admin access required
 *       - Payment must be in pending status
 *       - Sets markedCompletedAt timestamp
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *         example: "507f1f77bcf86cd799439020"
 *     responses:
 *       200:
 *         description: Payment marked as completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Payment'
 *             example:
 *               success: true
 *               message: "Payment marked as completed successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439020"
 *                 status: "completed"
 *                 markedCompletedAt: "2025-01-16T14:30:00Z"
 *               statusCode: 200
 *       400:
 *         description: Invalid ID or payment already completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyCompleted:
 *                 summary: Already marked as completed
 *                 value:
 *                   success: false
 *                   message: "Payment is already marked as completed"
 *                   statusCode: 400
 *               invalidId:
 *                 summary: Invalid payment ID
 *                 value:
 *                   success: false
 *                   message: "Invalid payment ID"
 *                   statusCode: 400
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
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */