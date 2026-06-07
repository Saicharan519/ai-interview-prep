import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export function errorMiddleware(err, req, res, _next) {
  // Mongoose CastError: invalid ObjectId in URL params
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, message: 'Invalid resource ID' });
  }

  // Mongoose ValidationError: document failed schema validation
  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.keys(err.errors).join(', ');
    return res.status(400).json({
      success: false,
      message: `Validation failed on: ${fields}`,
      errors: Object.fromEntries(
        Object.entries(err.errors).map(([k, v]) => [k, v.message])
      ),
    });
  }

  // MongoDB duplicate key (e.g. unique email constraint)
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'field';
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    });
  }

  // Multer file size / type errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File exceeds the 5 MB limit' });
  }

  if (err.message === 'Only PDF and DOCX files are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // JWT errors surfaced outside authMiddleware
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  logger.error({ err, method: req.method, url: req.originalUrl }, 'Unhandled server error');

  const status = err.statusCode ?? err.status ?? 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : (err.message ?? 'Internal Server Error');

  res.status(status).json({ success: false, message });
}
