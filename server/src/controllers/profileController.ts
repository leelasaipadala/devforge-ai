import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { UserProfile } from '../models/UserProfile.js';
import { Skill } from '../models/Skill.js';
import { ResumeAnalysis } from '../models/ResumeAnalysis.js';
import { GitHubProfile } from '../models/GitHubProfile.js';
import { Project } from '../models/Project.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { CareerReadinessService } from '../services/careerReadinessService.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

// In-memory fallback cache when MongoDB connection is not active
const memoryProfiles = new Map<string, any>();

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    let profile: any = null;

    if (isMongoConnected) {
      profile = await UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] });
    } else {
      profile = memoryProfiles.get(userId);
    }

    if (!profile) {
      // Create default initial profile
      profile = {
        clerkUserId: userId,
        clerkId: userId,
        email: req.userEmail || 'user@devforge.ai',
        name: req.userName || 'DevForge Engineer',
        experienceLevel: 'Undergraduate Student',
        targetRole: 'Full Stack Developer',
        careerGoal: 'Land a Software Engineering position',
        weeklyLearningHours: 10,
        targetCompanies: ['Google', 'Microsoft', 'Stripe'],
        programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
        technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
        education: {
          educationLevel: 'Undergraduate',
          degreeProgram: 'B.Tech',
          specialization: 'Computer Science',
          institution: '',
          graduationYear: 2026,
          educationStatus: 'Currently Studying',
          currentYear: '3rd Year',
        },
        onboardingCompleted: false,
        readinessScore: 45,
      };

      if (isMongoConnected) {
        profile = await UserProfile.create(profile);
      } else {
        memoryProfiles.set(userId, profile);
      }
    }

    // Recalculate DevForge Career Readiness Score
    let skills: any[] = [];
    let resumeScore = 0;
    let githubScore = 0;
    let projectCount = 0;
    let completedProjects = 0;
    let avgInterviewScore = 0;

    if (isMongoConnected) {
      skills = await Skill.find({ userId });
      const latestResume = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });
      if (latestResume) resumeScore = latestResume.atsScore;

      const ghProfile = await GitHubProfile.findOne({ userId });
      if (ghProfile) githubScore = ghProfile.score;

      const projects = await Project.find({ userId });
      projectCount = projects.length;
      completedProjects = projects.filter((p) => p.status === 'Completed').length;

      const interviews = await InterviewSession.find({ userId });
      if (interviews.length > 0) {
        const total = interviews.reduce((acc, curr) => acc + curr.overallScore, 0);
        avgInterviewScore = Math.round(total / interviews.length);
      }
    }

    const readinessData = CareerReadinessService.calculateReadinessScore({
      targetRole: profile.targetRole,
      skills,
      resumeScore,
      githubScore,
      projectCount,
      completedProjects,
      avgInterviewScore,
    });

    profile.readinessScore = readinessData.overallScore;

    res.json({
      success: true,
      profile,
      readinessData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const updates = req.body;

    let profile: any = null;

    if (isMongoConnected) {
      profile = await UserProfile.findOneAndUpdate(
        { $or: [{ clerkUserId: userId }, { clerkId: userId }] },
        { $set: { ...updates, clerkUserId: userId, clerkId: userId } },
        { new: true, upsert: true }
      );
    } else {
      const existing = memoryProfiles.get(userId) || {};
      profile = { ...existing, ...updates, clerkUserId: userId, clerkId: userId };
      memoryProfiles.set(userId, profile);
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating profile' });
  }
};

export const completeOnboarding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      name,
      experienceLevel,
      targetRole,
      careerGoal,
      weeklyLearningHours,
      targetCompanies,
      programmingLanguages,
      technologies,
      education,
      initialSkills,
      githubUsername,
    } = req.body;

    const profileData = {
      clerkUserId: userId,
      clerkId: userId,
      email: req.userEmail || 'user@devforge.ai',
      name: name || req.userName || 'DevForge Developer',
      experienceLevel: experienceLevel || 'Undergraduate Student',
      targetRole: targetRole || 'Full Stack Developer',
      careerGoal: careerGoal || 'Land a Software Engineering Role',
      weeklyLearningHours: Number(weeklyLearningHours) || 10,
      targetCompanies: Array.isArray(targetCompanies) ? targetCompanies : ['Google', 'Linear', 'Vercel'],
      programmingLanguages: Array.isArray(programmingLanguages) ? programmingLanguages : ['JavaScript', 'TypeScript'],
      technologies: Array.isArray(technologies) ? technologies : ['React', 'Node.js', 'Express', 'MongoDB'],
      education: education || {
        educationLevel: 'Undergraduate',
        degreeProgram: 'B.Tech',
        specialization: 'Computer Science',
        institution: '',
        graduationYear: 2026,
        educationStatus: 'Currently Studying',
        currentYear: '3rd Year',
      },
      githubUsername: githubUsername || '',
      onboardingCompleted: true,
    };

    let profile: any = null;

    if (isMongoConnected) {
      profile = await UserProfile.findOneAndUpdate(
        { $or: [{ clerkUserId: userId }, { clerkId: userId }] },
        { $set: profileData },
        { new: true, upsert: true }
      );

      // Save initial skills if provided
      const allSelectedSkills = [
        ...(Array.isArray(programmingLanguages) ? programmingLanguages : []),
        ...(Array.isArray(technologies) ? technologies : []),
        ...(Array.isArray(initialSkills) ? initialSkills : []),
      ];

      if (allSelectedSkills.length > 0) {
        await Skill.deleteMany({ userId });
        const uniqueSkills = Array.from(new Set(allSelectedSkills));
        const skillDocs = uniqueSkills.map((sk: string) => ({
          userId,
          name: sk,
          category: 'Core Competency',
          proficiency: 'Intermediate',
          learningStatus: 'In Progress',
        }));
        await Skill.insertMany(skillDocs);
      }

      await Activity.create({
        userId,
        type: 'onboarding',
        title: 'Completed DevForge AI Onboarding',
        description: `Target role set to ${targetRole}`,
      });
    } else {
      profile = { ...profileData };
      memoryProfiles.set(userId, profile);
    }

    res.json({ success: true, profile, message: 'Onboarding completed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error completing onboarding' });
  }
};
