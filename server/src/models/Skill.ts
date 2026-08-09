import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  userId: string;
  name: string;
  category: 'Programming' | 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'DevOps' | 'AI/ML' | 'Tools' | 'Soft Skills' | 'Core Competency' | 'Framework';
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  learningStatus: 'To Learn' | 'In Progress' | 'Mastered';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Programming', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Tools', 'Soft Skills', 'Core Competency', 'Framework'],
      default: 'Programming',
    },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
    },
    learningStatus: {
      type: String,
      enum: ['To Learn', 'In Progress', 'Mastered'],
      default: 'In Progress',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema);
