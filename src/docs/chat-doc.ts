/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat conversation and message history endpoints (Real-time via Socket.IO)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Message ID
 *           example: "507f1f77bcf86cd799439050"
 *         senderId:
 *           type: string
 *           description: Sender user ID
 *           example: "507f1f77bcf86cd799439001"
 *         senderRole:
 *           type: string
 *           enum: [customer, service_provider]
 *           description: Sender role
 *           example: "customer"
 *         message:
 *           type: string
 *           description: Message content
 *           example: "When can you start the work?"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2025-01-20T10:30:00Z"
 *         isRead:
 *           type: boolean
 *           description: Whether message has been read
 *           example: false
 *     
 *     Conversation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Conversation ID
 *           example: "507f1f77bcf86cd799439060"
 *         serviceRequestId:
 *           type: object
 *           description: Associated service request
 *           properties:
 *             id:
 *               type: string
 *               example: "507f1f77bcf86cd799439013"
 *             description:
 *               type: string
 *               example: "Fix electrical wiring"
 *             status:
 *               type: string
 *               example: "in_progress"
 *         customerId:
 *           type: object
 *           description: Customer information
 *           properties:
 *             id:
 *               type: string
 *               example: "507f1f77bcf86cd799439001"
 *             phoneNumber:
 *               type: string
 *               example: "1234567890"
 *         serviceProviderId:
 *           type: object
 *           description: Service provider information
 *           properties:
 *             id:
 *               type: string
 *               example: "507f1f77bcf86cd799439002"
 *             phoneNumber:
 *               type: string
 *               example: "0987654321"
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         lastMessageAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-20T10:30:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-18T08:00:00Z"
 *     
 *     MessagesResponse:
 *       type: object
 *       properties:
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         hasMore:
 *           type: boolean
 *           description: Whether there are more messages to load
 *           example: false
 */

/**
 * @swagger
 * /api/conversations/{serviceRequestId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get conversation by service request ID
 *     description: |
 *       Retrieve conversation details including all messages for a service request.
 *       
 *       **Access Control:**
 *       - Customer who created the service request
 *       - Assigned service provider
 *       
 *       **Requirements:**
 *       - Provider must be assigned to service request
 *       - One conversation per service request
 *       
 *       **Real-Time:**
 *       For live messaging, use Socket.IO namespace `/chat`
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceRequestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service request ID
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Conversation'
 *             example:
 *               success: true
 *               message: "Conversation retrieved successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439060"
 *                 serviceRequestId:
 *                   id: "507f1f77bcf86cd799439013"
 *                   description: "Fix electrical wiring"
 *                   status: "in_progress"
 *                 customerId:
 *                   id: "507f1f77bcf86cd799439001"
 *                   phoneNumber: "1234567890"
 *                 serviceProviderId:
 *                   id: "507f1f77bcf86cd799439002"
 *                   phoneNumber: "0987654321"
 *                 messages:
 *                   - _id: "507f1f77bcf86cd799439050"
 *                     senderId: "507f1f77bcf86cd799439001"
 *                     senderRole: "customer"
 *                     message: "When can you start?"
 *                     timestamp: "2025-01-20T10:00:00Z"
 *                     isRead: true
 *                   - _id: "507f1f77bcf86cd799439051"
 *                     senderId: "507f1f77bcf86cd799439002"
 *                     senderRole: "service_provider"
 *                     message: "I can start tomorrow morning"
 *                     timestamp: "2025-01-20T10:05:00Z"
 *                     isRead: false
 *                 lastMessageAt: "2025-01-20T10:05:00Z"
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
 *         description: Not authorized to access this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Not authorized to access this conversation"
 *               statusCode: 403
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No conversation found for this service request"
 *               statusCode: 404
 */

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get messages for a conversation
 *     description: |
 *       Retrieve messages with pagination support.
 *       
 *       **Pagination:**
 *       - Default limit: 50 messages
 *       - Use `before` parameter for loading older messages
 *       - Returns `hasMore` indicator
 *       
 *       **Access Control:**
 *       - Only conversation participants (customer and provider)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *         example: "507f1f77bcf86cd799439060"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of messages to retrieve (default 50)
 *         example: 50
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Load messages before this timestamp (ISO 8601)
 *         example: "2025-01-20T10:00:00Z"
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessagesResponse'
 *             example:
 *               success: true
 *               message: "Messages retrieved successfully"
 *               data:
 *                 messages:
 *                   - _id: "507f1f77bcf86cd799439050"
 *                     senderId: "507f1f77bcf86cd799439001"
 *                     senderRole: "customer"
 *                     message: "When can you start?"
 *                     timestamp: "2025-01-20T10:00:00Z"
 *                     isRead: true
 *                   - _id: "507f1f77bcf86cd799439051"
 *                     senderId: "507f1f77bcf86cd799439002"
 *                     senderRole: "service_provider"
 *                     message: "Tomorrow morning at 9 AM"
 *                     timestamp: "2025-01-20T10:05:00Z"
 *                     isRead: false
 *                 hasMore: false
 *               statusCode: 200
 *       400:
 *         description: Invalid conversation ID
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
 *         description: Not authorized to access this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */