import app from './app';
import { connectDatabase } from './config/database';
import { config } from './config';
import { createDefaultAdmin } from './utils/createDefaultAdmin';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    console.log('Starting server...');
    console.log('--------------------------------');
    console.log('Process:', process.env.MONGODB_URI);

    // Connect to MongoDB
    await connectDatabase();

    // Create default admin user
    await createDefaultAdmin();

    // Start Express server
    const port = config.port;
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Health check: http://localhost:${port}/health`);
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

