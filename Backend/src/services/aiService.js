import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  path: new URL('../../.env', import.meta.url),
  override: true,
});

// Zod validation schema for AI response
const aiResponseSchema = z.object({
  atsScore: z.number().min(0).max(100),
  matchScore: z.number().min(0).max(100),
  skillGaps: z.array(z.string()),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      sampleAnswer: z.string(),
    })
  ),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      sampleAnswer: z.string(),
    })
  ),
  optimizedResume: z.string(),
  roadmap: z.array(
    z.object({
      skill: z.string(),
      resources: z.array(z.string()),
      steps: z.array(z.string()),
    })
  ),
});

export async function analyzeResumeAndJob(
  resumeText,
  jobDescription,
  jobTitle
) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
    });

    const prompt = `You are an expert career coach, ATS system, and technical interviewer. Analyze the provided resume against the job posting and generate a comprehensive interview preparation report.

RESUME:
${resumeText}

JOB TITLE:
${jobTitle}

JOB DESCRIPTION:
${jobDescription}

Please analyze and return ONLY a raw valid JSON object. No markdown formatting, no backticks, no explanation text before or after. Include:
- atsScore: How well the resume is written and formatted for ATS systems (0-100)
- matchScore: How well this resume matches this specific job (0-100)
- skillGaps: Array of missing skills or experience gaps
- technicalQuestions: At least 5 technical interview questions with sample answers
- behavioralQuestions: At least 5 behavioral interview questions with sample answers
- optimizedResume: Full rewritten resume text optimized for ATS and the job
- roadmap: Learning roadmap for each skill gap with resources and steps

Return ONLY valid JSON, no extra text.`;

    const response = await model.generateContent(prompt);
    const textContent = response.response.text();

    // Strip any markdown code fences (```json ... ```) if present
    const cleanedText = textContent
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .trim();

    // Parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error(
        `Failed to parse AI response as JSON: ${parseError.message}`
      );
    }

    if (
      parsedData.roadmap &&
      !Array.isArray(parsedData.roadmap) &&
      typeof parsedData.roadmap === 'object'
    ) {
      parsedData.roadmap = Object.entries(parsedData.roadmap).map(
        ([skill, value]) => ({
          skill,
          resources: Array.isArray(value?.resources) ? value.resources : [],
          steps: Array.isArray(value?.steps)
            ? value.steps
            : Array.isArray(value)
              ? value
              : [],
        })
      );
    }

    for (const questionType of [
      'technicalQuestions',
      'behavioralQuestions',
    ]) {
      if (Array.isArray(parsedData[questionType])) {
        parsedData[questionType] = parsedData[questionType].map((item) => ({
          question: item.question,
          sampleAnswer:
            item.sampleAnswer ||
            item.answer ||
            item.sample_answer ||
            item.sample ||
            '',
        }));
      }
    }

    // Validate with Zod
    const validationResult = aiResponseSchema.safeParse(parsedData);

    if (!validationResult.success) {
      throw new Error(
        `AI response validation failed: ${JSON.stringify(
          validationResult.error.errors
        )}`
      );
    }

    return validationResult.data;
  } catch (error) {
    throw error;
  }
}
