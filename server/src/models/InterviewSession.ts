import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewQuestionResult {
  questionId?: string;
  questionText: string;
  category: string;
  userAnswer: string;
  feedback: string;
  score: number; // 0-100
  strengths?: string[];
  improvements?: string[];
}

export interface IInterviewSession extends Document {
  userId: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  mode: 'Practice' | 'Mock Interview' | 'Timed Session';
  overallScore: number;
  questions: IInterviewQuestionResult[];
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewQuestionResultSchema = new Schema({
  questionId: { type: String, default: '' },
  questionText: { type: String, required: true },
  category: { type: String, default: 'General' },
  userAnswer: { type: String, default: '' },
  feedback: { type: String, default: '' },
  score: { type: Number, default: 0 },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
});

const InterviewSessionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, default: 'Backend' },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    mode: {
      type: String,
      enum: ['Practice', 'Mock Interview', 'Timed Session'],
      default: 'Practice',
    },
    overallScore: { type: Number, default: 0 },
    questions: [InterviewQuestionResultSchema],
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

export const InterviewSession = mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
