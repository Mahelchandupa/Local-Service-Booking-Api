import { Router } from 'express';
import {
  createServiceRequestController,
  getServiceRequestByIdController,
  getServiceRequestsController,
  updateServiceRequestStatusController,
  assignServiceProviderController,
} from '../controllers/serviceRequestController';
import {
  acceptJobController,
  rejectJobController,
  updateProgressController,
} from '../controllers/providerJobController';
import {
  createServiceRequestValidation,
  updateStatusValidation,
  assignProviderValidation,
  queryValidation,
} from '../validators/serviceRequestValidators';
import {
  rejectJobValidation,
  updateProgressValidation,
} from '../validators/providerJobValidators';
import { validateRequest } from '../middleware/validation';
import { authenticate, requireCustomer, requireAdmin, requireProvider } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/service-requests
 * @desc    Create a new service request
 * @access  Customer only
 */
router.post(
  '/',
  authenticate,
  requireCustomer,
  validateRequest(createServiceRequestValidation),
  createServiceRequestController
);

/**
 * @route   GET /api/service-requests/:id
 * @desc    Get service request by ID
 * @access  Owner (customer/provider) or Admin
 */
router.get(
  '/:id',
  authenticate,
  getServiceRequestByIdController
);

/**
 * @route   GET /api/service-requests
 * @desc    Get service requests (filtered by role)
 * @access  Authenticated
 */
router.get(
  '/',
  authenticate,
  validateRequest(queryValidation),
  getServiceRequestsController
);

/**
 * @route   PATCH /api/service-requests/:id/status
 * @desc    Update service request status
 * @access  Customer (cancel), Provider (progress), Admin (override)
 */
router.patch(
  '/:id/status',
  authenticate,
  validateRequest(updateStatusValidation),
  updateServiceRequestStatusController
);

/**
 * @route   PATCH /api/service-requests/:id/assign
 * @desc    Assign service provider to request
 * @access  Admin only
 */
router.patch(
  '/:id/assign',
  authenticate,
  requireAdmin,
  validateRequest(assignProviderValidation),
  assignServiceProviderController
);

/**
 * @route   PATCH /api/service-requests/:id/accept
 * @desc    Provider accepts assigned job
 * @access  Service Provider only (assigned provider)
 */
router.patch(
  '/:id/accept',
  authenticate,
  requireProvider,
  acceptJobController
);

/**
 * @route   PATCH /api/service-requests/:id/reject
 * @desc    Provider rejects assigned job
 * @access  Service Provider only (assigned provider)
 */
router.patch(
  '/:id/reject',
  authenticate,
  requireProvider,
  validateRequest(rejectJobValidation),
  rejectJobController
);

/**
 * @route   PATCH /api/service-requests/:id/progress
 * @desc    Provider updates job progress
 * @access  Service Provider only (assigned provider)
 */
router.patch(
  '/:id/progress',
  authenticate,
  requireProvider,
  validateRequest(updateProgressValidation),
  updateProgressController
);

export default router;