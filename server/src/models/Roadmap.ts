import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmapItem {
  id: string;
  title: string;
  completed: boolean;
  type?: 'topic' | 'project' | 'skill';
  estimatedHours?: number;
  resources?: string[];
}

export interface IRoadmapPhase {
  id: string;
  title: string;
  description: string;
  skills: string[];
  topics: string[];
  projects: string[];
  estimatedEffort: string;
  completion: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  items: IRoadmapItem[];
}

export interface IRoadmap extends Document {
  userId: string;
  targetRole: string;
  title: string;
  description?: string;
  phases: IRoadmapPhase[];
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapItemSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  type: { type: String, default: 'topic' },
  estimatedHours: { type: Number, default: 5 },
  resources: [{ type: String }],
});

const RoadmapPhaseSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  skills: [{ type: String }],
  topics: [{ type: String }],
  projects: [{ type: String }],
  estimatedEffort: { type: String, default: '2-3 weeks' },
  completion: { type: Number, default: 0 },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
  items: [RoadmapItemSchema],
});

const RoadmapSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    targetRole: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    phases: [RoadmapPhaseSchema],
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
