import { Server as SocketIOServer, Socket } from 'socket.io';
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
import { verifyToken } from './jwt';
import {
  getOrCreateConversation,
  addMessage,
  markMessagesAsRead,
} from '../services/chatService';

/**
 * Initialize Redis adapter for Socket.IO scaling
 */
export const initializeRedisAdapter = async (io: SocketIOServer) => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    // Create Redis clients (pub/sub)
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    // Handle errors
    pubClient.on('error', (err: any) => console.error('Redis Pub Client Error:', err));
    subClient.on('error', (err: any) => console.error('Redis Sub Client Error:', err));

    // Connect both clients
    await Promise.all([pubClient.connect(), subClient.connect()]);

    // Create and attach adapter
    io.adapter(createAdapter(pubClient, subClient));

    console.log('✅ Redis adapter initialized for Socket.IO');
  } catch (error) {
    console.error('❌ Failed to initialize Redis adapter:', error);
    console.warn('⚠️  Running without Redis adapter (single server mode)');
  }
};

/**
 * Setup chat socket handlers
 */
export const setupChatHandlers = (io: SocketIOServer) => {
  const chatNamespace = io.of('/chat');

  // Apply authentication middleware
  chatNamespace.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      socket.data.user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      next(new Error(`Authentication error: ${message}`));
    }
  });

  // Handle connections
  chatNamespace.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    const userRole = socket.data.user.role;

    console.log(`💬 Chat connected: ${userId} (${userRole})`);

    /**
     * Join conversation room
     * Client emits: joinRoom({ serviceRequestId })
     */
    socket.on('joinRoom', async (data: { serviceRequestId: string }, callback) => {
      try {
        const { serviceRequestId } = data;

        // Get or create conversation (verifies authorization)
        const conversation = await getOrCreateConversation(serviceRequestId, userId);

        // Join room (room name = conversationId)
        const roomName = conversation._id.toString();
        socket.join(roomName);

        // Store current room in socket data
        socket.data.currentRoom = roomName;
        socket.data.conversationId = conversation._id.toString();

        // Mark existing messages as read
        await markMessagesAsRead(conversation._id.toString(), userId);

        console.log(`👥 User ${userId} joined room ${roomName}`);

        // Send success callback
        if (callback) {
          callback({
            success: true,
            conversationId: conversation._id.toString(),
            room: roomName,
          });
        }

        // Notify other party that user has joined
        socket.to(roomName).emit('userJoined', {
          userId,
          userRole,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to join room';
        console.error('Error joining room:', message);

        if (callback) {
          callback({
            success: false,
            error: message,
          });
        }
      }
    });

    /**
     * Send message
     * Client emits: sendMessage({ message })
     */
    socket.on('sendMessage', async (data: { message: string }, callback) => {
      try {
        const { message } = data;

        if (!message || !message.trim()) {
          throw new Error('Message cannot be empty');
        }

        if (message.length > 5000) {
          throw new Error('Message too long (max 5000 characters)');
        }

        const conversationId = socket.data.conversationId;
        if (!conversationId) {
          throw new Error('Not in a conversation. Join a room first.');
        }

        // Save message to MongoDB (source of truth)
        const savedMessage = await addMessage(conversationId, userId, message);

        // Prepare message data for real-time broadcast
        const messageData = {
          _id: savedMessage._id?.toString() || '',
          senderId: savedMessage.senderId.toString(),
          senderRole: savedMessage.senderRole,
          message: savedMessage.message,
          timestamp: savedMessage.timestamp,
          isRead: savedMessage.isRead,
        };

        // Emit to all users in the room (including sender)
        const roomName = socket.data.currentRoom;
        chatNamespace.to(roomName).emit('receiveMessage', messageData);

        console.log(`📨 Message sent in room ${roomName} by ${userId}`);

        // Send success callback
        if (callback) {
          callback({
            success: true,
            message: messageData,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send message';
        console.error('Error sending message:', message);

        if (callback) {
          callback({
            success: false,
            error: message,
          });
        }
      }
    });

    /**
     * Mark messages as read
     * Client emits: markAsRead()
     */
    socket.on('markAsRead', async (callback) => {
      try {
        const conversationId = socket.data.conversationId;
        if (!conversationId) {
          throw new Error('Not in a conversation');
        }

        const markedCount = await markMessagesAsRead(conversationId, userId);

        console.log(`✓ ${markedCount} messages marked as read in ${conversationId}`);

        if (callback) {
          callback({
            success: true,
            markedCount,
          });
        }

        // Notify other party
        const roomName = socket.data.currentRoom;
        socket.to(roomName).emit('messagesRead', {
          userId,
          readAt: new Date(),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to mark as read';
        console.error('Error marking as read:', message);

        if (callback) {
          callback({
            success: false,
            error: message,
          });
        }
      }
    });

    /**
     * Typing indicator
     * Client emits: typing({ isTyping: boolean })
     */
    socket.on('typing', (data: { isTyping: boolean }) => {
      const roomName = socket.data.currentRoom;
      if (!roomName) return;

      // Notify other users in room (not sender)
      socket.to(roomName).emit('userTyping', {
        userId,
        userRole,
        isTyping: data.isTyping,
      });
    });

    /**
     * Leave room
     */
    socket.on('leaveRoom', () => {
      const roomName = socket.data.currentRoom;
      if (roomName) {
        socket.leave(roomName);
        socket.to(roomName).emit('userLeft', { userId, userRole });
        delete socket.data.currentRoom;
        delete socket.data.conversationId;
        console.log(`👋 User ${userId} left room ${roomName}`);
      }
    });

    /**
     * Disconnect
     */
    socket.on('disconnect', () => {
      const roomName = socket.data.currentRoom;
      if (roomName) {
        socket.to(roomName).emit('userLeft', { userId, userRole });
      }
      console.log(`💬 Chat disconnected: ${userId}`);
    });
  });

  console.log('✅ Chat handlers initialized');
};