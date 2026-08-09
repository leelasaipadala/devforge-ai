import mongoose, { Schema, Document } from 'mongoose';

export interface IGitHubRepo {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
  hasReadme: boolean;
  updatedAt: string;
}

export interface IGitHubProfile extends Document {
  userId: string;
  username: string;
  score: number;
  publicRepos: number;
  followers: number;
  following: number;
  bio?: string;
  avatarUrl?: string;
  topLanguages: { language: string; count: number; percentage: number }[];
  repositories: IGitHubRepo[];
  strengths: string[];
  improvements: string[];
  recommendedActions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GitHubRepoSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  language: { type: String, default: 'TypeScript' },
  url: { type: String, default: '' },
  hasReadme: { type: Boolean, default: true },
  updatedAt: { type: String, default: '' },
});

const GitHubProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    score: { type: Number, default: 0 },
    publicRepos: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    topLanguages: [
      {
        language: { type: String },
        count: { type: Number },
        percentage: { type: Number },
      },
    ],
    repositories: [GitHubRepoSchema],
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    recommendedActions: [{ type: String }],
  },
  { timestamps: true }
);

export const GitHubProfile = mongoose.model<IGitHubProfile>('GitHubProfile', GitHubProfileSchema);
