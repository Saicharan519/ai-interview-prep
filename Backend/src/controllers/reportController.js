import Report from '../models/Report.js';
import { extractTextFromFile } from '../services/extractTextService.js';
import { analyzeResumeAndJob } from '../services/aiService.js';
import { generatePDF } from '../services/pdfService.js';

export async function createReport(req, res) {
  try {
    let resumeText = null;
    let resumeFilePath = null;

    // Handle two sources of resume text: file upload or manual input
    if (req.file) {
      // SOURCE A: File upload
      resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);
      resumeFilePath = req.file.path;
    } else if (req.body.resumeText) {
      // SOURCE B: Manual input
      resumeText = req.body.resumeText;
      resumeFilePath = null;
    } else {
      return res.status(400).json({
        success: false,
        message:
          'Please upload a resume file or enter resume text manually',
      });
    }

    // Validate required job fields
    const { jobTitle, jobDescription } = req.body;
    if (!jobTitle || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job title and job description are required',
      });
    }

    // Analyze resume and job with AI
    const aiAnalysis = await analyzeResumeAndJob(
      resumeText,
      jobDescription,
      jobTitle
    );

    // Create and save report with all AI results
    const report = new Report({
      userId: req.user.id,
      jobTitle,
      jobDescription,
      resumeText,
      resumeFilePath,
      skillGaps: aiAnalysis.skillGaps,
      technicalQuestions: aiAnalysis.technicalQuestions,
      behavioralQuestions: aiAnalysis.behavioralQuestions,
      optimizedResume: aiAnalysis.optimizedResume,
      atsScore: aiAnalysis.atsScore,
      matchScore: aiAnalysis.matchScore,
      roadmap: aiAnalysis.roadmap,
    });

    await report.save();

    return res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    throw error;
  }
}

export async function getAllReports(req, res) {
  try {
    // Ownership check: only fetch reports for current user
    const reports = await Report.find({ userId: req.user.id })
      .select(
        'jobTitle atsScore matchScore skillGaps createdAt'
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    throw error;
  }
}

export async function getReportById(req, res) {
  try {
    // Ownership check: userId filter prevents unauthorized access to other users' reports
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    throw error;
  }
}

export async function deleteReport(req, res) {
  try {
    // Ownership check: ensure user can only delete their own reports
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    throw error;
  }
}

export async function downloadReportPdf(req, res) {
  try {
    // Ownership check: ensure user can only download their own reports
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Build professional HTML with all report sections using inline CSS
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Preparation Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
      background: white;
    }
    
    .container {
      max-width: 850px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 25px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      color: #1e293b;
      margin-bottom: 10px;
    }
    
    .score-row {
      display: flex;
      gap: 30px;
      margin-top: 15px;
    }
    
    .score-item {
      flex: 1;
    }
    
    .score-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .score-value {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
    }
    
    .section {
      margin-bottom: 35px;
      page-break-inside: avoid;
    }
    
    .section h2 {
      font-size: 18px;
      color: #1e293b;
      margin-bottom: 15px;
      border-left: 4px solid #2563eb;
      padding-left: 12px;
    }
    
    .skill-gaps {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .skill-tag {
      background: #dbeafe;
      color: #1e40af;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }
    
    .question-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8fafc;
      border-left: 3px solid #2563eb;
      border-radius: 4px;
    }
    
    .question-number {
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 8px;
    }
    
    .question-text {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .answer-label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
      margin-top: 8px;
    }
    
    .answer-text {
      color: #475569;
      font-size: 13px;
      line-height: 1.5;
    }
    
    .roadmap-item {
      margin-bottom: 25px;
      padding: 15px;
      background: #f0f9ff;
      border-radius: 6px;
      border-left: 3px solid #0284c7;
    }
    
    .roadmap-skill {
      font-weight: bold;
      color: #0c4a6e;
      font-size: 15px;
      margin-bottom: 10px;
    }
    
    .roadmap-resources {
      margin-bottom: 12px;
    }
    
    .roadmap-label {
      font-size: 11px;
      color: #0c4a6e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    
    .roadmap-list {
      margin-left: 15px;
    }
    
    .roadmap-list li {
      margin-bottom: 5px;
      color: #0c4a6e;
      font-size: 13px;
    }
    
    .resume-section {
      background: #fafafa;
      padding: 20px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #1e293b;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Section -->
    <div class="header">
      <h1>${report.jobTitle}</h1>
      <div class="score-row">
        <div class="score-item">
          <div class="score-label">ATS Score</div>
          <div class="score-value">${report.atsScore}%</div>
        </div>
        <div class="score-item">
          <div class="score-label">Match Score</div>
          <div class="score-value">${report.matchScore}%</div>
        </div>
      </div>
    </div>
    
    <!-- Skill Gaps Section -->
    <div class="section">
      <h2>Skill Gaps</h2>
      <div class="skill-gaps">
        ${report.skillGaps.map((skill) => `<div class="skill-tag">${skill}</div>`).join('')}
      </div>
    </div>
    
    <!-- Technical Questions Section -->
    <div class="section">
      <h2>Technical Interview Questions</h2>
      ${report.technicalQuestions
        .map(
          (q, idx) => `
        <div class="question-item">
          <div class="question-number">Q${idx + 1}.</div>
          <div class="question-text">${q.question}</div>
          <div class="answer-label">Sample Answer:</div>
          <div class="answer-text">${q.sampleAnswer}</div>
        </div>
      `
        )
        .join('')}
    </div>
    
    <!-- Behavioral Questions Section -->
    <div class="section">
      <h2>Behavioral Interview Questions</h2>
      ${report.behavioralQuestions
        .map(
          (q, idx) => `
        <div class="question-item">
          <div class="question-number">Q${idx + 1}.</div>
          <div class="question-text">${q.question}</div>
          <div class="answer-label">Sample Answer:</div>
          <div class="answer-text">${q.sampleAnswer}</div>
        </div>
      `
        )
        .join('')}
    </div>
    
    <!-- Roadmap Section -->
    <div class="section">
      <h2>Learning Roadmap</h2>
      ${report.roadmap
        .map(
          (item) => `
        <div class="roadmap-item">
          <div class="roadmap-skill">${item.skill}</div>
          <div class="roadmap-resources">
            <div class="roadmap-label">Resources:</div>
            <ul class="roadmap-list">
              ${item.resources.map((resource) => `<li>${resource}</li>`).join('')}
            </ul>
          </div>
          <div class="roadmap-resources">
            <div class="roadmap-label">Learning Steps:</div>
            <ul class="roadmap-list">
              ${item.steps.map((step) => `<li>${step}</li>`).join('')}
            </ul>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
    
    <!-- Optimized Resume Section -->
    <div class="section">
      <h2>Optimized Resume</h2>
      <div class="resume-section">${report.optimizedResume}</div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Generate PDF from HTML
    const pdfBuffer = await generatePDF(htmlContent);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${report._id}.pdf"`
    );

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    throw error;
  }
}
