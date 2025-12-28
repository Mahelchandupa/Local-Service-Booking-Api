const { body, query } = require('express-validator');

/**
 * Validation rules for creating a service request
 */
export const createServiceRequestValidation = [
  body('categoryId')
    .trim()
    .notEmpty()
    .withMessage('Service category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('preferredDate')
    .notEmpty()
    .withMessage('Preferred date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate(),

  body('preferredTime')
    .optional()
    .trim()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM format)'),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isObject()
    .withMessage('Location must be an object'),

  body('location.fullAddress')
    .trim()
    .notEmpty()
    .withMessage('Full address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),

  body('location.coordinates')
    .notEmpty()
    .withMessage('Coordinates are required')
    .isObject()
    .withMessage('Coordinates must be an object'),

  body('location.coordinates.lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.coordinates.lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

/**
 * Validation rules for updating service request status
 */
export const updateStatusValidation = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'])
    .withMessage(
      'Status must be one of: accepted, on_the_way, in_progress, completed, cancelled'
    ),

  body('cancellationReason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Cancellation reason must be between 5 and 500 characters'),

  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
];

/**
 * Validation rules for assigning service provider
 */
export const assignProviderValidation = [
  body('serviceProviderId')
    .trim()
    .notEmpty()
    .withMessage('Service provider ID is required')
    .isMongoId()
    .withMessage('Invalid service provider ID'),
];

/**
 * Validation rules for query parameters
 */
export const queryValidation = [
  query('status')
    .optional()
    .trim()
    .isIn(['requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'])
    .withMessage(
      'Status must be one of: requested, accepted, on_the_way, in_progress, completed, cancelled'
    ),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];