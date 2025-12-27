import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { registerValidation, loginValidation } from '../validators';
import { validateRequest } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRequest(registerValidation), registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateRequest(loginValidation), loginUser);

export default router;
