import { Request, Response, NextFunction } from 'express';
import {
  getConversationByServiceRequest,
  getMessages,
} from '../services/chatService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../types';

/**
 * Get conversation by service request ID
 * GET /api/conversations/:serviceRequestId
 * Access: Customer or assigned Provider
 */
export const getConversationController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    const { serviceRequestId } = req.params;

    const conversation = await getConversationByServiceRequest(
      serviceRequestId,
      userId
    );

    if (!conversation) {
      sendErrorResponse(
        res,
        'No conversation found for this service request',
        HttpStatus.NOT_FOUND
      );
      return;
    }

    sendSuccessResponse(
      res,
      'Conversation retrieved successfully',
      conversation,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve conversation';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Not authorized')
      ? HttpStatus.FORBIDDEN
      : message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Get messages for a conversation
 * GET /api/messages/:conversationId
 * Access: Participants only
 */
export const getMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    const { conversationId } = req.params;
    const { limit, before } = req.query;

    const result = await getMessages(
      conversationId,
      userId,
      limit ? parseInt(limit as string) : undefined,
      before ? new Date(before as string) : undefined
    );

    sendSuccessResponse(
      res,
      'Messages retrieved successfully',
      result,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve messages';
    const statusCode = message.includes('not found')
      ? HttpStatus.NOT_FOUND
      : message.includes('Not authorized')
      ? HttpStatus.FORBIDDEN
      : message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};