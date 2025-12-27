import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/my-discord-app',
  jwtSecret: process.env.JWT_SECRET || 'ec13383da26c826dad5c0ee0b698504dd7143dc4bc767af21fede9aae26f2506',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

