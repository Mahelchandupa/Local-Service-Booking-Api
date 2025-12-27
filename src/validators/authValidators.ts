const { body } = require('express-validator');
import { ROLES } from '../constants/roles';

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn([ROLES.ADMIN, ROLES.CUSTOMER, ROLES.PROVIDER])
    .withMessage(`Role must be one of: ${ROLES.ADMIN}, ${ROLES.CUSTOMER}, or ${ROLES.PROVIDER}`),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('phoneNumber')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),

  // Custom validation: ensure at least one of phoneNumber or email is provided
  body()
    .custom((value: any) => {
      if (!value.phoneNumber && !value.email) {
        throw new Error('Either phone number or email is required');
      }
      return true;
    })
    .withMessage('Either phone number or email must be provided'),
];

