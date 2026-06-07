import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  { question: { type: String, required: true }, sampleAnswer: { type: String, default: '' } },
  { _id: false }
);

const roadmapItemSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    resources: [String],
    steps: [String],
  },
  { _id: false }
);

const verdict = { type: String, enum: ['full', 'partial', 'none'] };

const scoreBreakdownSchema = new mongoose.Schema(
  {
    requiredSkillsMatched: [String],
    requiredSkillsPartial: [String],
    requiredSkillsMissing: [String],
    optionalSkillsMatched: [String],
    scoreMath: {
      skillsPoints: Number,
      experiencePoints: Number,
      domainPoints: Number,
    },
    experienceMatch: {
      required: String,
      candidate: String,
      verdict,
    },
    domainMatch: {
      verdict,
      reason: String,
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: { type: String, required: true, trim: true, maxlength: 200 },
    jobDescription: { type: String, required: true, maxlength: 8000 },
    resumeText: { type: String, required: true, maxlength: 15000 },
    skillGaps: [String],
    scoreBreakdown: scoreBreakdownSchema,
    technicalQuestions: [questionSchema],
    behavioralQuestions: [questionSchema],
    optimizedResume: String,
    atsScore: { type: Number, min: 0, max: 100 },
    matchScore: { type: Number, min: 0, max: 100 },
    roadmap: [roadmapItemSchema],
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
