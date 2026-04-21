import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      required: true,
    },
    resumeFilePath: {
      type: String,
      default: null,
    },
    skillGaps: [String],
    technicalQuestions: [
      {
        question: String,
        sampleAnswer: String,
      },
    ],
    behavioralQuestions: [
      {
        question: String,
        sampleAnswer: String,
      },
    ],
    optimizedResume: String,
    atsScore: Number,
    matchScore: Number,
    roadmap: [
      {
        skill: String,
        resources: [String],
        steps: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
