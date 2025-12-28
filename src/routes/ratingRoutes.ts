import { Router } from 'express';
import {
  createRatingController,
  getRatingsByProviderController,
  getRatingByServiceRequestController,
} from '../controllers/ratingController';
import {
  createRatingValidation,
  ratingQueryValidation,
} from '../validators/ratingValidators';
import { validateRequest } from '../middleware/validation';
import { authenticate, requireCustomer } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/ratings
 * @desc    Create a new rating
 * @access  Customer only
 */
router.post(
  '/',
  authenticate,
  requireCustomer,
  validateRequest(createRatingValidation),
  createRatingController
);

/**
 * @route   GET /api/ratings/provider/:providerId
 * @desc    Get ratings for a service provider
 * @access  Authenticated
 */
router.get(
  '/provider/:providerId',
  authenticate,
  validateRequest(ratingQueryValidation),
  getRatingsByProviderController
);

/**
 * @route   GET /api/ratings/service-request/:id
 * @desc    Get rating for a specific service request
 * @access  Authenticated
 */
router.get(
  '/service-request/:id',
  authenticate,
  getRatingByServiceRequestController
);

export default router;