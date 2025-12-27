import { Request, Response, NextFunction } from 'express';
import { register, login, RegisterDto, LoginDto } from '../services/authService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';

/**
 * Register a new user
 * POST /auth/register
 * Validation is handled by express-validator middleware
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const registerDto: RegisterDto = req.body;
    const result = await register(registerDto);
    sendSuccessResponse(
      res,
      'User registered successfully',
      result,
      HttpStatus.CREATED
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    const statusCode =
      message.includes('already registered') || message.includes('Invalid')
        ? HttpStatus.CONFLICT
        : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Login user
 * POST /auth/login
 * Validation is handled by express-validator middleware
 */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const loginDto: LoginDto = req.body;
    const result = await login(loginDto);
    sendSuccessResponse(res, 'Login successful', result, HttpStatus.OK);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    const statusCode =
      message.includes('Invalid credentials') || message.includes('required')
        ? HttpStatus.UNAUTHORIZED
        : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

