/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with phone number, optional email, password, and role
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             customer:
 *               summary: Register as customer
 *               value:
 *                 phoneNumber: "1234567890"
 *                 email: "customer@example.com"
 *                 password: "SecurePass123"
 *                 role: "customer"
 *             serviceProvider:
 *               summary: Register as service provider
 *               value:
 *                 phoneNumber: "9876543210"
 *                 email: "provider@example.com"
 *                 password: "ProviderPass123"
 *                 role: "service_provider"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *               data:
 *                 user:
 *                   id: "507f1f77bcf86cd799439011"
 *                   phoneNumber: "1234567890"
 *                   email: "customer@example.com"
 *                   role: "customer"
 *                   isVerified: false
 *                   isActive: true
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               statusCode: 201
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               error: "[{\"field\":\"phoneNumber\",\"message\":\"Phone number is required\"}]"
 *               statusCode: 400
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Phone number already registered"
 *               error: "Phone number already registered"
 *               statusCode: 409
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

