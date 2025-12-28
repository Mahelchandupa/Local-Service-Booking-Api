import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from './jwt';

let io: SocketIOServer | null = null;

/**
 * Socket Authentication Middleware
 */
const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = verifyToken(token);

    // Attach user info to socket
    socket.data.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    next(new Error(`Authentication error: ${message}`));
  }
};

/**
 * Initialize Socket.IO server
 */
export const initializeSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
    // Connection options
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  // Handle connections
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    const userRole = socket.data.user.role;

    console.log(`✅ User connected: ${userId} (${userRole})`);

    // Join user-specific room
    socket.join(userId);

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${userId} - Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to notification service',
      userId,
    });
  });

  console.log('✅ Socket.IO server initialized');

  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO first.');
  }
  return io;
};

/**
 * Emit notification to specific user
 */
export const emitNotificationToUser = (
  userId: string,
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    referenceId?: string;
    isRead: boolean;
    createdAt: Date;
  }
) => {
  try {
    if (!io) {
      console.warn('Socket.IO not initialized. Cannot emit notification.');
      return;
    }

    // Emit to user's room
    io.to(userId).emit('notification', notification);

    console.log(`📢 Notification emitted to user ${userId}: ${notification.title}`);
  } catch (error) {
    console.error('Error emitting notification:', error);
  }
};

/**
 * Emit notification count update to user
 */
export const emitUnreadCountToUser = (userId: string, unreadCount: number) => {
  try {
    if (!io) {
      return;
    }

    io.to(userId).emit('unread_count', { unreadCount });

    console.log(`📊 Unread count (${unreadCount}) emitted to user ${userId}`);
  } catch (error) {
    console.error('Error emitting unread count:', error);
  }
};