// MUST import express-async-errors as the very first import
import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import { errorMiddleware } from './src/middlewares/errorMiddleware.js';

const app = express();

// CORS middleware with credentials support
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route mounts
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Global error handler - MUST be registered LAST after all routes
app.use(errorMiddleware);

export default app;
