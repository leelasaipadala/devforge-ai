import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplicationTimeline {
  status: string;
  title: string;
  date: Date;
  notes?: string;
}

export interface IJobApplication extends Document {
  userId: string;
  company: string;
  position: string;
  location?: string;
  workMode?: 'Remote' | 'Hybrid' | 'On-site';
  jobType?: 'Full Time' | 'Part Time' | 'Internship' | 'Contract' | 'Freelance';
  jobUrl?: string;
  appliedDate?: Date;
  deadline?: Date;
  status: 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
  priority?: 'Low' | 'Medium' | 'High';
  notes?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  nextAction?: string;
  nextActionDate?: Date;
  salaryRange?: string;
  description?: string;
  skills?: string[];
  timeline?: IJobApplicationTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationTimelineSchema = new Schema({
  status: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
});

const JobApplicationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Remote' },
    jobType: { type: String, enum: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance'], default: 'Full Time' },
    jobUrl: { type: String, default: '' },
    appliedDate: { type: Date, default: Date.now },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
      default: 'Applied',
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    notes: { type: String, default: '' },
    recruiterName: { type: String, default: '' },
    recruiterEmail: { type: String, default: '' },
    nextAction: { type: String, default: '' },
    nextActionDate: { type: Date },
    salaryRange: { type: String, default: '' },
    description: { type: String, default: '' },
    skills: [{ type: String }],
    timeline: [JobApplicationTimelineSchema],
  },
  { timestamps: true }
);

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
