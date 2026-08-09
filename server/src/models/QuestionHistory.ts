import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionHistory extends Document {
  userId: string;
  questionId: string;
  technology: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  userAnswer?: string;
  feedback?: string;
  answeredAt: Date;
}

const QuestionHistorySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    questionId: { type: String, required: true, index: true },
    technology: { type: String, required: true, index: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    score: { type: Number, default: 0 },
    userAnswer: { type: String, default: '' },
    feedback: { type: String, default: '' },
    answeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to quickly find questions answered by user per technology/category/difficulty
QuestionHistorySchema.index({ userId: 1, technology: 1, category: 1, difficulty: 1 });
QuestionHistorySchema.index({ userId: 1, questionId: 1 });

export const QuestionHistory = mongoose.model<IQuestionHistory>('QuestionHistory', QuestionHistorySchema);
