import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeAnalysis extends Document {
  userId: string;
  fileName: string;
  fileSize?: number;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  foundKeywords: string[];
  suggestions: string[];
  sectionScores: {
    structure: number;
    skills: number;
    experience: number;
    projects: number;
    education: number;
  };
  rawTextPreview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeAnalysisSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    atsScore: { type: Number, required: true, default: 0 },
    summary: { type: String, default: '' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    missingKeywords: [{ type: String }],
    foundKeywords: [{ type: String }],
    suggestions: [{ type: String }],
    sectionScores: {
      structure: { type: Number, default: 70 },
      skills: { type: Number, default: 70 },
      experience: { type: Number, default: 70 },
      projects: { type: Number, default: 70 },
      education: { type: Number, default: 70 },
    },
    rawTextPreview: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ResumeAnalysis = mongoose.model<IResumeAnalysis>('ResumeAnalysis', ResumeAnalysisSchema);
