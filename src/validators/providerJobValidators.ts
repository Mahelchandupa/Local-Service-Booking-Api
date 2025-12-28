const { body } = require('express-validator');

/**
 * Validation rules for rejecting a job
 */
export const rejectJobValidation = [
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Rejection reason must be between 5 and 500 characters'),
];

/**
 * Validation rules for updating job progress
 */
export const updateProgressValidation = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['on_the_way', 'in_progress', 'completed'])
    .withMessage('Status must be one of: on_the_way, in_progress, completed'),

  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
];