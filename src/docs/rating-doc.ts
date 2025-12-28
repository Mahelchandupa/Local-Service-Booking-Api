/**
 * @swagger
 * tags:
 *   name: Ratings & Reviews
 *   description: Rating and review management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateRatingRequest:
 *       type: object
 *       required:
 *         - serviceRequestId
 *         - rating
 *       properties:
 *         serviceRequestId:
 *           type: string
 *           description: Service request ID (must be COMPLETED with PAID payment)
 *           example: "507f1f77bcf86cd799439013"
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating value from 1 (worst) to 5 (best)
 *           example: 5
 *         feedback:
 *           type: string
 *           minLength: 5
 *           maxLength: 1000
 *           description: Optional feedback text
 *           example: "Excellent service! Very professional and completed the work on time."
 *     
 *     Rating:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Rating ID
 *           example: "507f1f77bcf86cd799439030"
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
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         feedback:
 *           type: string
 *           example: "Excellent service! Very professional."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-17T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-01-17T10:00:00Z"
 *     
 *     ProviderRatingsList:
 *       type: object
 *       properties:
 *         ratings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Rating'
 *         total:
 *           type: integer
 *           description: Total number of ratings for this provider
 *           example: 25
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 3
 *         averageRating:
 *           type: number
 *           format: float
 *           description: Provider's average rating
 *           example: 4.5
 *         totalRatings:
 *           type: integer
 *           description: Total count of ratings
 *           example: 25
 */

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     tags:
 *       - Ratings & Reviews
 *     summary: Create a new rating
 *     description: |
 *       Customer submits a rating for a completed service request.
 *       
 *       **Requirements:**
 *       - Service request must be in COMPLETED status
 *       - Payment for the service request must be COMPLETED
 *       - Customer must own the service request
 *       - One rating per service request (no duplicates)
 *       - Rating must be between 1 and 5
 *       
 *       **Effects:**
 *       - Creates rating record
 *       - Updates service provider's average rating
 *       - Updates service provider's total rating count
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRatingRequest'
 *           examples:
 *             withFeedback:
 *               summary: Rating with feedback
 *               value:
 *                 serviceRequestId: "507f1f77bcf86cd799439013"
 *                 rating: 5
 *                 feedback: "Excellent service! Very professional and completed the work on time."
 *             ratingOnly:
 *               summary: Rating without feedback
 *               value:
 *                 serviceRequestId: "507f1f77bcf86cd799439013"
 *                 rating: 4
 *             averageRating:
 *               summary: Average rating
 *               value:
 *                 serviceRequestId: "507f1f77bcf86cd799439013"
 *                 rating: 3
 *                 feedback: "Service was okay, but took longer than expected."
 *     responses:
 *       201:
 *         description: Rating submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Rating'
 *             example:
 *               success: true
 *               message: "Rating submitted successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439030"
 *                 serviceRequestId: "507f1f77bcf86cd799439013"
 *                 customerId: "507f1f77bcf86cd799439014"
 *                 serviceProviderId: "507f1f77bcf86cd799439015"
 *                 rating: 5
 *                 feedback: "Excellent service! Very professional."
 *                 createdAt: "2025-01-17T10:00:00Z"
 *               statusCode: 201
 *       400:
 *         description: Validation error or business rule violation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notCompleted:
 *                 summary: Service not completed
 *                 value:
 *                   success: false
 *                   message: "Can only rate completed service requests"
 *                   statusCode: 400
 *               paymentNotCompleted:
 *                 summary: Payment not completed
 *                 value:
 *                   success: false
 *                   message: "Can only rate service requests with completed payments"
 *                   statusCode: 400
 *               invalidRating:
 *                 summary: Invalid rating value
 *                 value:
 *                   success: false
 *                   message: "Rating must be between 1 and 5"
 *                   statusCode: 400
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Not authorized or rating already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notAuthorized:
 *                 summary: Not authorized to rate
 *                 value:
 *                   success: false
 *                   message: "Not authorized to rate this service request"
 *                   statusCode: 403
 *               alreadyExists:
 *                 summary: Rating already exists
 *                 value:
 *                   success: false
 *                   message: "Rating already exists for this service request"
 *                   statusCode: 403
 *               notCustomer:
 *                 summary: Only customers can rate
 *                 value:
 *                   success: false
 *                   message: "You do not have permission to access this resource"
 *                   statusCode: 403
 *       404:
 *         description: Service request, customer profile, or payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serviceRequestNotFound:
 *                 summary: Service request not found
 *                 value:
 *                   success: false
 *                   message: "Service request not found"
 *                   statusCode: 404
 *               paymentNotFound:
 *                 summary: Payment not found
 *                 value:
 *                   success: false
 *                   message: "Payment record not found for this service request"
 *                   statusCode: 404
 */

/**
 * @swagger
 * /api/ratings/provider/{providerId}:
 *   get:
 *     tags:
 *       - Ratings & Reviews
 *     summary: Get ratings for a service provider
 *     description: |
 *       Retrieve all ratings for a specific service provider with pagination.
 *       
 *       **Returns:**
 *       - List of ratings with customer names and service details
 *       - Provider's average rating
 *       - Total rating count
 *       - Pagination metadata
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service provider ID
 *         example: "507f1f77bcf86cd799439015"
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
 *           maximum: 50
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Ratings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProviderRatingsList'
 *             example:
 *               success: true
 *               message: "Ratings retrieved successfully"
 *               data:
 *                 ratings:
 *                   - id: "507f1f77bcf86cd799439030"
 *                     customerId:
 *                       id: "507f1f77bcf86cd799439014"
 *                       name: "John Doe"
 *                     serviceRequestId:
 *                       id: "507f1f77bcf86cd799439013"
 *                       description: "Fix electrical wiring"
 *                     rating: 5
 *                     feedback: "Excellent service!"
 *                     createdAt: "2025-01-17T10:00:00Z"
 *                 total: 25
 *                 page: 1
 *                 totalPages: 3
 *                 averageRating: 4.5
 *                 totalRatings: 25
 *               statusCode: 200
 *       400:
 *         description: Invalid provider ID or query parameters
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
 *         description: Service provider not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Service provider not found"
 *               statusCode: 404
 */

/**
 * @swagger
 * /api/ratings/service-request/{id}:
 *   get:
 *     tags:
 *       - Ratings & Reviews
 *     summary: Get rating for a specific service request
 *     description: |
 *       Retrieve the rating for a specific service request.
 *       
 *       **Returns:**
 *       - Rating details with customer and provider information
 *       - Service request details
 *       - null if no rating exists
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
 *         description: Rating retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Rating'
 *             example:
 *               success: true
 *               message: "Rating retrieved successfully"
 *               data:
 *                 id: "507f1f77bcf86cd799439030"
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
 *                 rating: 5
 *                 feedback: "Excellent service! Very professional."
 *                 createdAt: "2025-01-17T10:00:00Z"
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
 *       404:
 *         description: No rating found for this service request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No rating found for this service request"
 *               statusCode: 404
 */