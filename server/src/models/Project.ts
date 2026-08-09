import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'Idea' | 'Planning' | 'In Progress' | 'Completed' | 'Archived';
  startDate?: Date;
  endDate?: Date;
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Idea', 'Planning', 'In Progress', 'Completed', 'Archived'],
      default: 'In Progress',
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    skills: [{ type: String }],
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    category: { type: String, default: 'Web Application' },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
