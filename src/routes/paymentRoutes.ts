import { Router } from 'express';
import {
  createPaymentController,
  getPaymentByIdController,
  getPaymentsController,
  markPaymentAsPaidController,
} from '../controllers/paymentController';
import {
  createPaymentValidation,
  paymentQueryValidation,
} from '../validators/paymentValidators';
import { validateRequest } from '../middleware/validation';
import { authenticate, requireAdmin, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/payments
 * @desc    Create a new payment record
 * @access  Customer or Admin
 */
router.post(
  '/',
  authenticate,
  authorize('customer', 'admin'),
  validateRequest(createPaymentValidation),
  createPaymentController
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Owner (customer/provider) or Admin
 */
router.get(
  '/:id',
  authenticate,
  getPaymentByIdController
);

/**
 * @route   GET /api/payments
 * @desc    Get payments (filtered by role)
 * @access  Authenticated
 */
router.get(
  '/',
  authenticate,
  validateRequest(paymentQueryValidation),
  getPaymentsController
);

/**
 * @route   PATCH /api/payments/:id/mark-paid
 * @desc    Mark payment as paid
 * @access  Admin only
 */
router.patch(
  '/:id/mark-paid',
  authenticate,
  requireAdmin,
  markPaymentAsPaidController
);

export default router;