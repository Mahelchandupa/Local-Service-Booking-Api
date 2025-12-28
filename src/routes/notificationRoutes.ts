import { Router } from 'express';
import {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from '../controllers/notificationController';
import { notificationQueryValidation } from '../validators/notificationValidators';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for authenticated user
 * @access  Authenticated
 */
router.get(
  '/',
  authenticate,
  validateRequest(notificationQueryValidation),
  getNotificationsController
);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Authenticated
 * @note    This route must come before /:id to avoid route collision
 */
router.patch(
  '/read-all',
  authenticate,
  markAllNotificationsAsReadController
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Owner (authenticated user)
 */
router.patch(
  '/:id/read',
  authenticate,
  markNotificationAsReadController
);

export default router;