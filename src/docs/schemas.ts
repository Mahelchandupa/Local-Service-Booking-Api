/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - password
 *         - role
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: User's phone number (10-15 characters)
 *           example: "1234567890"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (optional)
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (min 8 characters, must contain uppercase, lowercase, and number)
 *           example: "SecurePass123"
 *         role:
 *           type: string
 *           enum: [customer, service_provider, admin]
 *           description: User role
 *           example: "customer"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: User's phone number (either phoneNumber or email is required)
 *           example: "1234567890"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (either phoneNumber or email is required)
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *           example: "SecurePass123"
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User ID
 *           example: "507f1f77bcf86cd799439011"
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *           example: "1234567890"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         role:
 *           type: string
 *           enum: [customer, service_provider, admin]
 *           description: User role
 *           example: "customer"
 *         isVerified:
 *           type: boolean
 *           description: Whether the user is verified
 *           example: false
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *           example: true
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Response message
 *           example: "User registered successfully"
 *         data:
 *           type: object
 *           description: Response data
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *           example: 201
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         error:
 *           type: string
 *           description: Error details
 *           example: "[{\"field\":\"phoneNumber\",\"message\":\"Phone number is required\"}]"
 *         statusCode:
 *           type: integer
 *           example: 400
 */

