import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  userId: string;
  type: 'skill' | 'resume' | 'github' | 'project' | 'interview' | 'job' | 'roadmap' | 'onboarding';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['skill', 'resume', 'github', 'project', 'interview', 'job', 'roadmap', 'onboarding'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
