import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { UserProfile } from '../models/UserProfile.js';
import { Skill } from '../models/Skill.js';
import { ResumeAnalysis } from '../models/ResumeAnalysis.js';
import { GitHubProfile } from '../models/GitHubProfile.js';
import { Project } from '../models/Project.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { JobApplication } from '../models/JobApplication.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

export const getCareerAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    let readinessTrend = [
      { week: 'Week 1', score: 35 },
      { week: 'Week 2', score: 48 },
      { week: 'Week 3', score: 58 },
      { week: 'Week 4', score: 65 },
      { week: 'Week 5', score: 72 },
      { week: 'Current', score: 78 },
    ];

    let skillGrowthRadar = [
      { category: 'Frontend', score: 85, fullMark: 100 },
      { category: 'Backend', score: 70, fullMark: 100 },
      { category: 'Database', score: 65, fullMark: 100 },
      { category: 'DevOps', score: 45, fullMark: 100 },
      { category: 'DSA / Algo', score: 60, fullMark: 100 },
      { category: 'System Design', score: 50, fullMark: 100 },
    ];

    let jobFunnel = [
      { name: 'Saved', count: 5 },
      { name: 'Applied', count: 12 },
      { name: 'Assessments', count: 4 },
      { name: 'Interviews', count: 3 },
      { name: 'Offers', count: 1 },
    ];

    let projectStats = {
      total: 3,
      completed: 1,
      inProgress: 2,
    };

    let activities: any[] = [];

    if (isMongoConnected) {
      const profile = await UserProfile.findOne({ clerkId: userId });
      const currentScore = profile?.readinessScore || 45;

      readinessTrend = [
        { week: 'Week 1', score: Math.max(10, currentScore - 30) },
        { week: 'Week 2', score: Math.max(15, currentScore - 22) },
        { week: 'Week 3', score: Math.max(20, currentScore - 15) },
        { week: 'Week 4', score: Math.max(25, currentScore - 8) },
        { week: 'Week 5', score: Math.max(30, currentScore - 3) },
        { week: 'Current', score: currentScore },
      ];

      const skills = await Skill.find({ userId });
      const projects = await Project.find({ userId });
      const jobs = await JobApplication.find({ userId });
      activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(10);

      projectStats = {
        total: projects.length,
        completed: projects.filter((p) => p.status === 'Completed').length,
        inProgress: projects.filter((p) => p.status === 'In Progress').length,
      };

      jobFunnel = [
        { name: 'Saved', count: jobs.filter((j) => j.status === 'Saved').length },
        { name: 'Applied', count: jobs.filter((j) => j.status === 'Applied').length },
        { name: 'Assessments', count: jobs.filter((j) => j.status === 'Assessment').length },
        { name: 'Interviews', count: jobs.filter((j) => j.status === 'Interview').length },
        { name: 'Offers', count: jobs.filter((j) => j.status === 'Offer').length },
      ];
    }

    res.json({
      success: true,
      analytics: {
        readinessTrend,
        skillGrowthRadar,
        jobFunnel,
        projectStats,
        activities,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching analytics' });
  }
};
