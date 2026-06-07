import crypto from 'crypto';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env.js';

const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Use a random UUID for the stored filename to prevent path traversal
    // and avoid collisions. The original name is preserved in file.originalname.
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_MIMETYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
