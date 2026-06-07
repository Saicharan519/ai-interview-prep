import Groq from 'groq-sdk';
import { z } from 'zod';
import { env } from '../config/env.js';

// Module-level singleton — Groq SDK is OpenAI-compatible
const groq = new Groq({ apiKey: env.GROQ_API_KEY });
const MODEL = env.GROQ_MODEL;

const verdictSchema = z.enum(['full', 'partial', 'none']);

// AI's job is EVIDENCE GATHERING only. matchScore is computed in code below.
// We still accept matchScore from the model (some calls may return one) but we
// always overwrite it with our deterministic computation.
const aiResponseSchema = z.object({
  atsScore: z.number().min(0).max(100),
  matchScore: z.number().min(0).max(100).optional(),
  skillGaps: z.array(z.string()),
  scoreBreakdown: z.object({
    requiredSkillsMatched: z.array(z.string()),
    requiredSkillsPartial: z.array(z.string()).default([]),
    requiredSkillsMissing: z.array(z.string()),
    optionalSkillsMatched: z.array(z.string()).default([]),
    experienceMatch: z.object({
      required: z.string(),
      candidate: z.string(),
      verdict: verdictSchema,
    }),
    domainMatch: z.object({
      verdict: verdictSchema,
      reason: z.string(),
    }),
  }),
  technicalQuestions: z.array(
    z.object({ question: z.string(), sampleAnswer: z.string() })
  ),
  behavioralQuestions: z.array(
    z.object({ question: z.string(), sampleAnswer: z.string() })
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

// ───────────────────────────────────────────────────────────────
// Deterministic match-score computation.
//
// LLMs are unreliable at arithmetic — they ignore formulas and drift toward
// "be encouraging". The fix: LLM produces evidence (matched/partial/missing
// skills, verdict labels) and the backend produces the number.
//
// Formula:
//   skillsPoints = ((P × 2) + Q) / (T × 2) × 60      where P=matched, Q=partial, T=total
//   experiencePoints = full:25 | partial:15 | none:0
//   domainPoints     = full:15 | partial:8  | none:0
//   matchScore       = sum (rounded)
// ───────────────────────────────────────────────────────────────
const EXPERIENCE_POINTS = { full: 25, partial: 15, none: 0 };
const DOMAIN_POINTS = { full: 15, partial: 8, none: 0 };

export function computeMatchScore(breakdown) {
  const matched = breakdown?.requiredSkillsMatched?.length ?? 0;
  const partial = breakdown?.requiredSkillsPartial?.length ?? 0;
  const missing = breakdown?.requiredSkillsMissing?.length ?? 0;
  const total = matched + partial + missing;

  const skillsPoints =
    total === 0
      ? 0
      : Math.round((((matched * 2) + partial) / (total * 2)) * 60);

  const experiencePoints = EXPERIENCE_POINTS[breakdown?.experienceMatch?.verdict] ?? 0;
  const domainPoints = DOMAIN_POINTS[breakdown?.domainMatch?.verdict] ?? 0;

  return {
    skillsPoints,
    experiencePoints,
    domainPoints,
    matchScore: skillsPoints + experiencePoints + domainPoints,
  };
}

export async function analyzeResumeAndJob(resumeText, jobDescription, jobTitle) {
  const prompt = buildAnalysisPrompt(resumeText, jobDescription, jobTitle);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a strict, honest senior technical recruiter. You return only valid JSON, never prose or markdown.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 8000,
  });

  const rawText = completion.choices[0]?.message?.content ?? '';

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('AI returned non-JSON. Please try again.');
  }

  normalizeRoadmap(parsed);
  normalizeQuestionFields(parsed);

  const validation = aiResponseSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error(
      `AI response failed schema validation: ${JSON.stringify(validation.error.errors)}`
    );
  }

  const data = validation.data;

  // Override AI's matchScore with the deterministic calculation.
  const { skillsPoints, experiencePoints, domainPoints, matchScore } = computeMatchScore(
    data.scoreBreakdown
  );
  data.matchScore = matchScore;
  data.scoreMath = { skillsPoints, experiencePoints, domainPoints };

  return data;
}

// Returns the async iterator from Groq's streaming chat completion.
// Each chunk is an OpenAI-style { choices: [{ delta: { content } }] }.
export async function streamInterviewFeedback({ jobTitle, question, userAnswer }) {
  return groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a senior engineer conducting a real technical interview. Be direct and honest. This is real practice, not encouragement.',
      },
      {
        role: 'user',
        content: buildInterviewFeedbackPrompt({ jobTitle, question, userAnswer }),
      },
    ],
    stream: true,
    temperature: 0.5,
    max_tokens: 1500,
  });
}

function buildInterviewFeedbackPrompt({ jobTitle, question, userAnswer }) {
  return `ROLE: ${jobTitle}
QUESTION: ${question}
CANDIDATE'S ANSWER: ${userAnswer || '(no answer provided)'}

Respond in this exact markdown format:

### What worked
- (specific things the candidate said that were correct or strong; if nothing, say so plainly)

### What was missing or wrong
- (specific gaps, vague points, or factual errors; be precise — quote the candidate's words when relevant)

### What a strong answer would include
- (the concrete points an excellent answer would cover)

### Verdict
**Excellent** | **Good** | **Needs Work** | **Insufficient** — one sentence justification.

Do not flatter. Do not give a "Good" rating to a weak answer. If the answer is one line, it is probably "Insufficient".`;
}

function buildAnalysisPrompt(resumeText, jobDescription, jobTitle) {
  return `You evaluate candidates strictly and honestly — not generously.

Your job is EVIDENCE GATHERING. The numeric match score will be computed by the backend from the breakdown you produce — do NOT try to inflate it by miscategorizing skills.

═══════════════════════════════════════
STEP 1 — REQUIRED SKILLS
═══════════════════════════════════════
List every REQUIRED skill, technology, qualification, or experience the JD demands. Then for each, classify based on resume evidence:

  MATCHED — clear, specific evidence (named project, role, or achievement using that skill)
  PARTIAL — adjacent or vague evidence (related skill, listed but no project, or mentioned without depth)
  MISSING — no evidence at all

Honesty rules:
- A skill listed in the resume but never used in a project → PARTIAL (not MATCHED)
- A skill that requires X years of experience but candidate has less → PARTIAL
- A "must have" the JD explicitly calls out, with no evidence → MISSING (not PARTIAL)

Also list OPTIONAL / "nice to have" skills the candidate happens to have.

═══════════════════════════════════════
STEP 2 — EXPERIENCE VERDICT
═══════════════════════════════════════
Compare the JD's experience requirement (e.g., "final year student", "3+ years backend") against the candidate.

  full    — candidate clearly meets or exceeds the requirement
  partial — candidate is adjacent (e.g., pre-final year, 2 yrs vs 3 yrs required)
  none    — major mismatch

═══════════════════════════════════════
STEP 3 — DOMAIN VERDICT
═══════════════════════════════════════
Compare the JD's domain/industry (e.g., "retail", "fintech", "e-commerce loyalty") to candidate's project domains.

  full    — direct projects in that domain
  partial — adjacent or transferable domain work
  none    — no domain overlap

═══════════════════════════════════════
STEP 4 — ATS SCORE (independent)
═══════════════════════════════════════
atsScore (0-100): how well the resume is FORMATTED for ATS parsers — clear section headers, consistent dates, no images/tables that break parsing, keyword presence. This is independent of job-fit.

═══════════════════════════════════════
INPUTS
═══════════════════════════════════════
JOB TITLE:
${jobTitle}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

═══════════════════════════════════════
OUTPUT — JSON ONLY, no commentary
═══════════════════════════════════════
{
  "atsScore": <0-100>,
  "scoreBreakdown": {
    "requiredSkillsMatched": [<MATCHED skill names>],
    "requiredSkillsPartial":  [<PARTIAL skill names>],
    "requiredSkillsMissing":  [<MISSING skill names>],
    "optionalSkillsMatched":  [<bonus skills>],
    "experienceMatch": {
      "required": "<what the JD demands>",
      "candidate": "<what the candidate has>",
      "verdict": "full" | "partial" | "none"
    },
    "domainMatch": {
      "verdict": "full" | "partial" | "none",
      "reason": "<one short sentence>"
    }
  },
  "skillGaps": [<at least 3 specific gaps as short strings — these drive the roadmap>],
  "technicalQuestions": [
    { "question": "...", "sampleAnswer": "..." }
    // at least 5 items, tailored to the role
  ],
  "behavioralQuestions": [
    { "question": "...", "sampleAnswer": "..." }
    // at least 5 items
  ],
  "optimizedResume": "<full rewritten resume text optimized for ATS and this JD>",
  "roadmap": [
    {
      "skill": "<missing skill>",
      "resources": ["<resource 1>", "<resource 2>"],
      "steps": ["<step 1>", "<step 2>", "<step 3>"]
    }
    // one entry per major gap
  ]
}`;
}

function normalizeRoadmap(parsed) {
  if (parsed.roadmap && !Array.isArray(parsed.roadmap) && typeof parsed.roadmap === 'object') {
    parsed.roadmap = Object.entries(parsed.roadmap).map(([skill, value]) => ({
      skill,
      resources: Array.isArray(value?.resources) ? value.resources : [],
      steps: Array.isArray(value?.steps) ? value.steps : Array.isArray(value) ? value : [],
    }));
  }
}

function normalizeQuestionFields(parsed) {
  for (const key of ['technicalQuestions', 'behavioralQuestions']) {
    if (Array.isArray(parsed[key])) {
      parsed[key] = parsed[key].map((item) => ({
        question: item.question,
        sampleAnswer: item.sampleAnswer ?? item.answer ?? item.sample_answer ?? item.sample ?? '',
      }));
    }
  }
}
