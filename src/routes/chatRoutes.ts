import { Router } from 'express';
import {
  getConversationController,
  getMessagesController,
} from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/conversations/:serviceRequestId
 * @desc    Get conversation by service request ID
 * @access  Customer or assigned Provider
 */
router.get(
  '/conversations/:serviceRequestId',
  authenticate,
  getConversationController
);

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Get messages for a conversation
 * @access  Participants only
 */
router.get(
  '/messages/:conversationId',
  authenticate,
  getMessagesController
);

export default router;