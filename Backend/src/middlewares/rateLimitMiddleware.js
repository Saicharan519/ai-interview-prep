import rateLimit from 'express-rate-limit';

const rateLimitResponse = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
  });
};

// Strict limit for login and register — guards against brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Tight limit for report creation — each request makes an expensive Gemini API call
export const reportCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip,
  handler: rateLimitResponse,
});

// Generous limit for read/delete operations
export const reportReadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip,
  handler: rateLimitResponse,
});
