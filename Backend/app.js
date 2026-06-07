import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import authRoutes from './src/routes/authRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import { errorMiddleware } from './src/middlewares/errorMiddleware.js';

const app = express();

// Security headers — must be first
app.use(helmet());

// CORS — lock to the configured client origin
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Structured request logging
app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== 'test' }));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check — no auth, no rate limit, returns process uptime
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// 404 — must come after all routes, before error middleware
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler — must be last
app.use(errorMiddleware);

export default app;
