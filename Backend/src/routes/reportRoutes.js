import express from 'express';
import { z } from 'zod';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = express.Router();

// Validation schema for creating reports
const createReportSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  jobDescription: z.string().min(1, 'Job description is required'),
  resumeText: z.string().optional(),
});

// All routes protected with authentication
router.use(authMiddleware);

// Create report with optional file upload and optional resume text
router.post(
  '/',
  uploadMiddleware.single('resume'),
  validate(createReportSchema),
  reportController.createReport
);

// Get all reports for current user
router.get('/', reportController.getAllReports);

// Get specific report by ID
router.get('/:id', reportController.getReportById);

// Delete report
router.delete('/:id', reportController.deleteReport);

// Download report as PDF
router.get('/:id/pdf', reportController.downloadReportPdf);

export default router;
