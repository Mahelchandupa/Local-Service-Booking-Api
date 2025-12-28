import { createServer } from 'http';
import app from './app';
import { connectDatabase } from './config/database';
import { config } from './config';
import { createDefaultAdmin } from './utils/createDefaultAdmin';
import { initializeNotificationListeners } from './services/notificationService';
import { initializeSocketIO } from './utils/socket';

/**
 * Start the server with Socket.IO support
 */
const startServer = async (): Promise<void> => {
  try {
    console.log('Starting server...');
    console.log('--------------------------------');

    // Connect to MongoDB
    await connectDatabase();

    // Create default admin user
    await createDefaultAdmin();

    // Initialize notification event listeners
    initializeNotificationListeners();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initializeSocketIO(httpServer);

    // Start server
    const port = config.port;
    httpServer.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Health check: http://localhost:${port}/health`);
      console.log(`🔌 Socket.IO: Ready for real-time notifications`);
      console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();