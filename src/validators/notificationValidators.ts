const { query } = require('express-validator');

/**
 * Validation rules for notification query parameters
 */
export const notificationQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean (true or false)'),
];