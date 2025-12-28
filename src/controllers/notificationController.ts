import { Request, Response, NextFunction } from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../types';

/**
 * Get notifications for authenticated user
 * GET /api/notifications
 * Access: Authenticated user
 */
export const getNotificationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    const { page, limit, isRead } = req.query;

    const result = await getUserNotifications(
      userId,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined,
      isRead === 'true' ? true : isRead === 'false' ? false : undefined
    );

    sendSuccessResponse(
      res,
      'Notifications retrieved successfully',
      result,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve notifications';
    const statusCode = message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 * Access: Owner (authenticated user)
 */
export const markNotificationAsReadController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;
    const { id } = req.params;

    const notification = await markNotificationAsRead(id, userId);

    sendSuccessResponse(
      res,
      'Notification marked as read',
      notification,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
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
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 * Access: Authenticated user
 */
export const markAllNotificationsAsReadController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user!.id;

    const result = await markAllNotificationsAsRead(userId);

    sendSuccessResponse(
      res,
      `${result.modifiedCount} notification(s) marked as read`,
      result,
      HttpStatus.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark notifications as read';
    const statusCode = message.includes('Invalid')
      ? HttpStatus.BAD_REQUEST
      : HttpStatus.INTERNAL_SERVER_ERROR;

    sendErrorResponse(res, message, statusCode);
  }
};