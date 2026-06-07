import express from 'express';
import { z } from 'zod';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import {
  reportCreateLimiter,
  reportReadLimiter,
} from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const createReportSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(200).trim(),
  jobDescription: z.string().min(1, 'Job description is required').max(8000),
  resumeText: z.string().max(15000).optional(),
});

router.use(authMiddleware);

router.post(
  '/',
  reportCreateLimiter,
  uploadMiddleware.single('resume'),
  validate(createReportSchema),
  reportController.createReport
);

router.get('/', reportReadLimiter, reportController.getAllReports);
router.get('/:id', reportReadLimiter, reportController.getReportById);
router.delete('/:id', reportReadLimiter, reportController.deleteReport);
router.get('/:id/pdf', reportReadLimiter, reportController.downloadReportPdf);
router.post(
  '/:id/interview/evaluate',
  reportReadLimiter,
  reportController.evaluateInterviewAnswer
);

export default router;
