import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  experienceLevel: string;
  targetRole: string;
  careerGoal: string;
  weeklyLearningHours: number;
  targetCompanies: string[];
  programmingLanguages: string[];
  technologies: string[];
  education: {
    educationLevel?: string;
    degreeProgram?: string;
    specialization?: string;
    institution?: string;
    graduationYear?: number | string;
    educationStatus?: string;
    currentYear?: string;
  };
  bio?: string;
  githubUsername?: string;
  onboardingCompleted: boolean;
  readinessScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema: Schema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    experienceLevel: { type: String, default: 'Undergraduate Student' },
    targetRole: { type: String, default: 'Full Stack Developer' },
    careerGoal: { type: String, default: '' },
    weeklyLearningHours: { type: Number, default: 10 },
    targetCompanies: [{ type: String }],
    programmingLanguages: [{ type: String }],
    technologies: [{ type: String }],
    education: {
      educationLevel: { type: String, default: 'Undergraduate' },
      degreeProgram: { type: String, default: 'B.Tech' },
      specialization: { type: String, default: 'Computer Science' },
      institution: { type: String, default: '' },
      graduationYear: { type: Schema.Types.Mixed, default: '' },
      educationStatus: { type: String, default: 'Currently Studying' },
      currentYear: { type: String, default: '' },
    },
    bio: { type: String, default: '' },
    githubUsername: { type: String, default: '' },
    onboardingCompleted: { type: Boolean, default: false },
    readinessScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
