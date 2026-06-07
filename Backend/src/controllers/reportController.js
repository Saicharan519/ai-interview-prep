import fs from 'fs/promises';
import Report from '../models/Report.js';
import { extractTextFromFile } from '../services/extractTextService.js';
import { analyzeResumeAndJob, streamInterviewFeedback } from '../services/aiService.js';
import { generatePDF } from '../services/pdfService.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { logger } from '../utils/logger.js';

export async function createReport(req, res) {
  let uploadedFilePath = null;

  try {
    let resumeText = null;

    if (req.file) {
      uploadedFilePath = req.file.path;
      resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file or enter resume text manually',
      });
    }

    const { jobTitle, jobDescription } = req.body;

    const aiAnalysis = await analyzeResumeAndJob(resumeText, jobDescription, jobTitle);

    const report = await Report.create({
      userId: req.user.id,
      jobTitle,
      jobDescription,
      resumeText,
      skillGaps: aiAnalysis.skillGaps,
      technicalQuestions: aiAnalysis.technicalQuestions,
      behavioralQuestions: aiAnalysis.behavioralQuestions,
      optimizedResume: aiAnalysis.optimizedResume,
      atsScore: aiAnalysis.atsScore,
      matchScore: aiAnalysis.matchScore,
      scoreBreakdown: {
        ...aiAnalysis.scoreBreakdown,
        scoreMath: aiAnalysis.scoreMath,
      },
      roadmap: aiAnalysis.roadmap,
    });

    return res.status(201).json({ success: true, report });
  } finally {
    // Always clean up the uploaded file — we've already extracted the text
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch((err) =>
        logger.warn({ err, path: uploadedFilePath }, 'Failed to delete uploaded file after extraction')
      );
    }
  }
}

export async function getAllReports(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find({ userId: req.user.id })
      .select('jobTitle atsScore matchScore skillGaps createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments({ userId: req.user.id }),
  ]);

  return res.status(200).json({
    success: true,
    reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getReportById(req, res) {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  return res.status(200).json({ success: true, report });
}

export async function deleteReport(req, res) {
  const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  return res.status(200).json({ success: true, message: 'Report deleted successfully' });
}

export async function downloadReportPdf(req, res) {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const htmlContent = buildReportHtml(report);
  const pdfBuffer = await generatePDF(htmlContent);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report-${report._id}.pdf"`);
  res.send(pdfBuffer);
}

// Streams Gemini's interview feedback to the client over Server-Sent Events.
// SSE is the right transport here: server -> client only, plain HTTP, no WebSocket
// upgrade. Each chunk is sent as `data: {"text":"..."}\n\n` and the stream ends
// with `data: [DONE]\n\n`.
export async function evaluateInterviewAnswer(req, res) {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const { question, userAnswer } = req.body ?? {};
  if (typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ success: false, message: 'question is required' });
  }
  if (typeof userAnswer !== 'string') {
    return res.status(400).json({ success: false, message: 'userAnswer is required' });
  }
  if (userAnswer.length > 5000) {
    return res.status(400).json({ success: false, message: 'Answer exceeds 5000 character limit' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering if proxied
  res.flushHeaders?.();

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  try {
    const stream = await streamInterviewFeedback({
      jobTitle: report.jobTitle,
      question: question.trim(),
      userAnswer: userAnswer.trim(),
    });

    // Groq returns an OpenAI-compatible chat completion stream.
    // Each chunk has shape { choices: [{ delta: { content?: string } }] }.
    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content;
      if (text) send({ text });
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    logger.error({ err }, 'Interview evaluation stream failed');
    send({ error: 'Evaluation failed. Please try again.' });
    res.end();
  }
}

// All user-controlled values run through escapeHtml() before being inserted into
// the HTML string, preventing XSS when Puppeteer renders the template.
function buildReportHtml(report) {
  const safeTitle = escapeHtml(report.jobTitle);
  const safeOptimizedResume = escapeHtml(report.optimizedResume);

  const skillGapsHtml = (report.skillGaps ?? [])
    .map((s) => `<div class="skill-tag">${escapeHtml(s)}</div>`)
    .join('');

  const buildQuestionsHtml = (questions) =>
    (questions ?? [])
      .map(
        (q, i) => `
        <div class="question-item">
          <div class="question-number">Q${i + 1}.</div>
          <div class="question-text">${escapeHtml(q.question)}</div>
          <div class="answer-label">Sample Answer:</div>
          <div class="answer-text">${escapeHtml(q.sampleAnswer)}</div>
        </div>`
      )
      .join('');

  const roadmapHtml = (report.roadmap ?? [])
    .map(
      (item) => `
      <div class="roadmap-item">
        <div class="roadmap-skill">${escapeHtml(item.skill)}</div>
        <div class="roadmap-resources">
          <div class="roadmap-label">Resources:</div>
          <ul class="roadmap-list">
            ${(item.resources ?? []).map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
          </ul>
        </div>
        <div class="roadmap-resources">
          <div class="roadmap-label">Learning Steps:</div>
          <ul class="roadmap-list">
            ${(item.steps ?? []).map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
          </ul>
        </div>
      </div>`
    )
    .join('');

  const generatedOn = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Interview Preparation Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; background: white; }
    .container { max-width: 850px; margin: 0 auto; padding: 40px; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 25px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; color: #1e293b; margin-bottom: 10px; }
    .score-row { display: flex; gap: 30px; margin-top: 15px; }
    .score-item { flex: 1; }
    .score-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .score-value { font-size: 32px; font-weight: bold; color: #2563eb; }
    .section { margin-bottom: 35px; page-break-inside: avoid; }
    .section h2 { font-size: 18px; color: #1e293b; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 12px; }
    .skill-gaps { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-tag { background: #dbeafe; color: #1e40af; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; }
    .question-item { margin-bottom: 20px; padding: 15px; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 4px; }
    .question-number { font-weight: bold; color: #2563eb; margin-bottom: 8px; }
    .question-text { font-weight: 600; color: #1e293b; margin-bottom: 8px; font-size: 14px; }
    .answer-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; margin-top: 8px; }
    .answer-text { color: #475569; font-size: 13px; line-height: 1.5; }
    .roadmap-item { margin-bottom: 25px; padding: 15px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #0284c7; }
    .roadmap-skill { font-weight: bold; color: #0c4a6e; font-size: 15px; margin-bottom: 10px; }
    .roadmap-resources { margin-bottom: 12px; }
    .roadmap-label { font-size: 11px; color: #0c4a6e; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 6px; }
    .roadmap-list { margin-left: 15px; }
    .roadmap-list li { margin-bottom: 5px; color: #0c4a6e; font-size: 13px; }
    .resume-section { background: #fafafa; padding: 20px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; color: #1e293b; white-space: pre-wrap; word-wrap: break-word; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${safeTitle}</h1>
      <div class="score-row">
        <div class="score-item">
          <div class="score-label">ATS Score</div>
          <div class="score-value">${escapeHtml(report.atsScore)}%</div>
        </div>
        <div class="score-item">
          <div class="score-label">Match Score</div>
          <div class="score-value">${escapeHtml(report.matchScore)}%</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Skill Gaps</h2>
      <div class="skill-gaps">${skillGapsHtml}</div>
    </div>

    <div class="section">
      <h2>Technical Interview Questions</h2>
      ${buildQuestionsHtml(report.technicalQuestions)}
    </div>

    <div class="section">
      <h2>Behavioral Interview Questions</h2>
      ${buildQuestionsHtml(report.behavioralQuestions)}
    </div>

    <div class="section">
      <h2>Learning Roadmap</h2>
      ${roadmapHtml}
    </div>

    <div class="section">
      <h2>Optimized Resume</h2>
      <div class="resume-section">${safeOptimizedResume}</div>
    </div>

    <div class="footer">
      <p>Generated on ${generatedOn}</p>
    </div>
  </div>
</body>
</html>`;
}
