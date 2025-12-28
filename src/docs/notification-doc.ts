/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints (event-driven)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Notification ID
 *           example: "507f1f77bcf86cd799439040"
 *         userId:
 *           type: string
 *           description: User ID (customer, provider, or admin)
 *           example: "507f1f77bcf86cd799439001"
 *         title:
 *           type: string
 *           description: Notification title
 *           example: "Service Provider Assigned"
 *         message:
 *           type: string
 *           description: Notification message
 *           example: "A service provider has been assigned to your service request."
 *         type:
 *           type: string
 *           enum: [service_request, status_update, payment, system]
 *           description: Notification type
 *           example: "service_request"
 *         referenceId:
 *           type: string
 *           description: Reference to related entity (e.g., service request ID)
 *           example: "507f1f77bcf86cd799439013"
 *         isRead:
 *           type: boolean
 *           description: Whether notification has been read
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-18T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-18T10:00:00Z"
 *     
 *     NotificationsList:
 *       type: object
 *       properties:
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         total:
 *           type: integer
 *           description: Total number of notifications
 *           example: 15
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 1
 *         unreadCount:
 *           type: integer
 *           description: Number of unread notifications
 *           example: 5
 *     
 *     MarkAllReadResponse:
 *       type: object
 *       properties:
 *         modifiedCount:
 *           type: integer
 *           description: Number of notifications marked as read
 *           example: 5
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get notifications for authenticated user
 *     description: |
 *       Retrieve notifications for the authenticated user with pagination and filtering.
 *       
 *       **Notifications are automatically created by system events:**
 *       - Provider assigned to service request
 *       - Job accepted by provider
 *       - Job completed by provider
 *       - Payment marked as paid
 *       - Rating received by provider
 *       
 *       **Returns:**
 *       - List of notifications (newest first)
 *       - Unread count
 *       - Pagination metadata
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *         description: Number of items per page (max 100)
 *         example: 20
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status (true for read, false for unread, omit for all)
 *         example: false
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NotificationsList'
 *             example:
 *               success: true
 *               message: "Notifications retrieved successfully"
 *               data:
 *                 notifications:
 *                   - id: "507f1f77bcf86cd799439040"
 *                     userId: "507f1f77bcf86cd799439001"
 *                     title: "Payment Confirmed"
 *                     message: "Your payment of 5000 has been confirmed."
 *                     type: "payment"
 *                     referenceId: "507f1f77bcf86cd799439013"
 *                     isRead: false
 *                     createdAt: "2025-01-18T10:00:00Z"
 *                   - id: "507f1f77bcf86cd799439041"
 *                     userId: "507f1f77bcf86cd799439001"
 *                     title: "Service Completed"
 *                     message: "Your service request has been completed. The service cost is 5000. Please proceed with payment."
 *                     type: "status_update"
 *                     referenceId: "507f1f77bcf86cd799439013"
 *                     isRead: true
 *                     createdAt: "2025-01-17T15:00:00Z"
 *                 total: 15
 *                 page: 1
 *                 totalPages: 1
 *                 unreadCount: 5
 *               statusCode: 200
 *       400:
 *         description: Invalid query parameters
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
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark notification as read
 *     description: |
 *       Mark a specific notification as read.
 *       
 *       **Requirements:**
 *       - User must own the notification
 *       - Notification must exist
 *       
 *       **Idempotent:**
 *       - If already marked as read, returns success without error
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *         example: "507f1f77bcf86cd799439040"
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *             example:
 *               success: true
 *               message: "Notification marked as read"
 *               data:
 *                 id: "507f1f77bcf86cd799439040"
 *                 userId: "507f1f77bcf86cd799439001"
 *                 title: "Payment Confirmed"
 *                 message: "Your payment of 5000 has been confirmed."
 *                 type: "payment"
 *                 referenceId: "507f1f77bcf86cd799439013"
 *                 isRead: true
 *                 createdAt: "2025-01-18T10:00:00Z"
 *                 updatedAt: "2025-01-18T11:00:00Z"
 *               statusCode: 200
 *       400:
 *         description: Invalid notification ID
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
 *         description: Forbidden - Not authorized to update this notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Not authorized to update this notification"
 *               statusCode: 403
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read
 *     description: |
 *       Mark all unread notifications as read for the authenticated user.
 *       
 *       **Bulk Operation:**
 *       - Updates all unread notifications in a single query
 *       - Returns count of notifications updated
 *       
 *       **Use Case:**
 *       - "Mark all as read" button in notification center
 *       - Clearing notification badge
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MarkAllReadResponse'
 *             examples:
 *               someUpdated:
 *                 summary: Some notifications marked as read
 *                 value:
 *                   success: true
 *                   message: "5 notification(s) marked as read"
 *                   data:
 *                     modifiedCount: 5
 *                   statusCode: 200
 *               noneUpdated:
 *                 summary: No unread notifications
 *                 value:
 *                   success: true
 *                   message: "0 notification(s) marked as read"
 *                   data:
 *                     modifiedCount: 0
 *                   statusCode: 200
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */