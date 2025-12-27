import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';

/**
 * Middleware to handle validation errors
 * Should be used after express-validator validation chains
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => {
      // Return field-specific error message
      return {
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
      };
    });

    sendErrorResponse(
      res,
      'Validation failed',
      HttpStatus.BAD_REQUEST,
      JSON.stringify(errorMessages)
    );
    return;
  }

  next();
};

/**
 * Helper function to run validation chain
 * Combines express-validator rules with validation middleware
 */
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error: any) => {
        return {
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg,
        };
      });

      sendErrorResponse(
        res,
        'Validation failed',
        HttpStatus.BAD_REQUEST,
        JSON.stringify(errorMessages)
      );
      return;
    }

    next();
  };
};

