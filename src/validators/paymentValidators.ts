const { body, query } = require('express-validator');

/**
 * Validation rules for creating a payment
 */
export const createPaymentValidation = [
  body('serviceRequestId')
    .trim()
    .notEmpty()
    .withMessage('Service request ID is required')
    .isMongoId()
    .withMessage('Invalid service request ID'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than zero'),

  body('paymentMethod')
    .optional()
    .trim()
    .isIn(['cash', 'card', 'online'])
    .withMessage('Payment method must be one of: cash, card, online'),
];

/**
 * Validation rules for query parameters
 */
export const paymentQueryValidation = [
  query('status')
    .optional()
    .trim()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be either pending or completed'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];