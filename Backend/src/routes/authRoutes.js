import express from 'express';
import { z } from 'zod';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { authLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required').max(128),
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

export default router;
