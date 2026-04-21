import jwt from 'jsonwebtoken';
import { isBlacklisted } from '../services/tokenBlacklist.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  // Check blacklist first before cryptographic verification
  // This prevents logged-out tokens from being verified
  if (isBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: 'Token has been invalidated',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}
