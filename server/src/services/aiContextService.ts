import { UserProfile } from '../models/UserProfile.js';
import { Skill } from '../models/Skill.js';
import { Project } from '../models/Project.js';
import { isMongoConnected } from '../config/db.js';

export interface IUserCareerContext {
  userId: string;
  name: string;
  targetRole: string;
  careerGoal: string;
  experienceLevel: string;
  education?: string;
  skills: string[];
  readinessScore: number;
  githubProfile?: { connected: boolean; username?: string };
  resume?: { uploaded: boolean; atsScore?: number };
  projects?: { count: number; titles: string[] };
}

export class AiContextService {
  /**
   * Load real stored user context from MongoDB strictly scoped to the authenticated Clerk user.
   */
  public static async getUserContext(userId: string, userName?: string): Promise<IUserCareerContext> {
    const context: IUserCareerContext = {
      userId,
      name: userName || 'Developer',
      targetRole: 'Full Stack Developer',
      careerGoal: 'Land a Software Engineer Position',
      experienceLevel: 'Intermediate',
      skills: ['JavaScript', 'React', 'Node.js'],
      readinessScore: 50,
      githubProfile: { connected: false },
      resume: { uploaded: false },
      projects: { count: 0, titles: [] },
    };

    if (!isMongoConnected) return context;

    try {
      // 1. User Profile Query
      const profile = await UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] });
      if (profile) {
        context.name = profile.name || context.name;
        context.targetRole = profile.targetRole || context.targetRole;
        context.careerGoal = profile.careerGoal || context.careerGoal;
        context.experienceLevel = profile.experienceLevel || context.experienceLevel;
        context.readinessScore = profile.readinessScore || 50;

        if (profile.education) {
          const eduParts = [profile.education.degreeProgram, profile.education.specialization, profile.education.institution].filter(Boolean);
          if (eduParts.length > 0) context.education = eduParts.join(', ');
        }

        if (profile.githubUsername) {
          context.githubProfile = { connected: true, username: profile.githubUsername };
        }
      }

      // 2. Skills Query
      const skills = await Skill.find({ userId });
      if (skills && skills.length > 0) {
        context.skills = skills.map((s) => s.name);
      }

      // 3. Projects Query
      const projects = await Project.find({ userId });
      if (projects && projects.length > 0) {
        context.projects = {
          count: projects.length,
          titles: projects.map((p) => p.title),
        };
      }
    } catch (err) {
      // Return safe context fallback if database error
    }

    return context;
  }
}
