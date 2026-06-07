import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { addToBlacklist } from '../services/tokenBlacklist.js';

const JWT_OPTIONS = { expiresIn: '7d' };

function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, JWT_OPTIONS);
}

function userPayload(user) {
  return { id: user._id, email: user.email };
}

function userResponse(user) {
  return { id: user._id, name: user.name, email: user.email };
}

export async function register(req, res) {
  // Input validation is handled by Zod in the route — req.body is already clean
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  const token = signToken(userPayload(user));

  return res.status(201).json({ success: true, token, user: userResponse(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Same message for both cases to prevent user enumeration
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signToken(userPayload(user));

  return res.status(200).json({ success: true, token, user: userResponse(user) });
}

export async function logout(req, res) {
  const token = req.headers.authorization?.slice(7);
  if (token) addToBlacklist(token);

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
