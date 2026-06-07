import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { env } from './env.js';

export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  logger.info({ uri: env.MONGODB_URI.replace(/\/\/[^@]+@/, '//***@') }, 'MongoDB connected');

  mongoose.connection.on('disconnected', () =>
    logger.warn('MongoDB disconnected')
  );
  mongoose.connection.on('error', (err) =>
    logger.error({ err }, 'MongoDB connection error')
  );
}
