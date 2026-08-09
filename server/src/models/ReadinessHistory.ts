import mongoose, { Schema, Document } from 'mongoose';

export interface IReadinessHistory extends Document {
  clerkUserId: string;
  overallScore: number;
  skillsScore: number;
  resumeScore: number;
  githubScore: number;
  projectsScore: number;
  interviewScore: number;
  learningScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReadinessHistorySchema: Schema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    overallScore: { type: Number, required: true },
    skillsScore: { type: Number, default: 0 },
    resumeScore: { type: Number, default: 0 },
    githubScore: { type: Number, default: 0 },
    projectsScore: { type: Number, default: 0 },
    interviewScore: { type: Number, default: 0 },
    learningScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ReadinessHistory = mongoose.model<IReadinessHistory>('ReadinessHistory', ReadinessHistorySchema);
