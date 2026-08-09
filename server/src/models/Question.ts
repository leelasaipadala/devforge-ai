import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  id: string;
  question: string;
  technology: string;
  category: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Conceptual' | 'Problem Solving' | 'System Design' | 'Behavioral';
  expectedTimeMinutes: number;
  explanation: string;
  keyConcepts: string[];
  tags: string[];
  isAiGenerated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    question: { type: String, required: true },
    technology: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true, index: true },
    type: {
      type: String,
      enum: ['Conceptual', 'Problem Solving', 'System Design', 'Behavioral'],
      default: 'Conceptual',
    },
    expectedTimeMinutes: { type: Number, default: 5 },
    explanation: { type: String, default: '' },
    keyConcepts: [{ type: String }],
    tags: [{ type: String }],
    isAiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const QuestionModel = mongoose.model<IQuestion>('Question', QuestionSchema);
