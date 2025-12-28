const { body, query } = require('express-validator');

/**
 * Validation rules for creating a rating
 */
export const createRatingValidation = [
  body('serviceRequestId')
    .trim()
    .notEmpty()
    .withMessage('Service request ID is required')
    .isMongoId()
    .withMessage('Invalid service request ID'),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('feedback')
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Feedback must be between 5 and 1000 characters'),
];

/**
 * Validation rules for query parameters
 */
export const ratingQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];