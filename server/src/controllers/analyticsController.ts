import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { UserProfile } from '../models/UserProfile.js';
import { Skill } from '../models/Skill.js';
import { ResumeAnalysis } from '../models/ResumeAnalysis.js';
import { GitHubProfile } from '../models/GitHubProfile.js';
import { Project } from '../models/Project.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { JobApplication } from '../models/JobApplication.js';
import { Roadmap } from '../models/Roadmap.js';
import { Activity } from '../models/Activity.js';
import { ReadinessHistory } from '../models/ReadinessHistory.js';
import { isMongoConnected } from '../config/db.js';

// Helper to convert Skill proficiency enum string to numeric score 0-100
const getSkillNumericScore = (prof: string): number => {
  switch (prof) {
    case 'Expert':
      return 100;
    case 'Advanced':
      return 85;
    case 'Intermediate':
      return 60;
    case 'Beginner':
      return 30;
    default:
      return 50;
  }
};

const emptyAnalyticsPayload = {
  readinessScore: {
    current: null,
    breakdown: {
      skillsScore: 0,
      resumeScore: 0,
      githubScore: 0,
      projectsScore: 0,
      interviewScore: 0,
      learningScore: 0,
    },
    history: [],
  },
  skills: {
    total: 0,
    mastered: 0,
    averageProficiency: null,
    categoryBreakdown: [],
  },
  roadmap: {
    totalTasks: 0,
    completedTasks: 0,
    completionPercentage: 0,
    learningHours: 0,
    progress: [],
  },
  interviews: {
    totalSessions: 0,
    averageScore: null,
    bestScore: null,
    performance: [],
  },
  projects: {
    total: 0,
    completed: 0,
    inProgress: 0,
    planning: 0,
    ideas: 0,
  },
  jobs: {
    totalApplications: 0,
    saved: 0,
    applied: 0,
    assessment: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
    responseRate: null,
    offerRate: null,
  },
  activity: [],
};

export const getCareerAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
      return;
    }

    if (!isMongoConnected) {
      res.json({
        success: true,
        analytics: emptyAnalyticsPayload,
      });
      return;
    }

    const userQuery = { $or: [{ userId }, { clerkUserId: userId }, { clerkId: userId }] };

    // 1. Fetch User Data in Parallel from MongoDB
    const [
      profile,
      skills,
      projects,
      jobs,
      interviews,
      roadmap,
      resumeAnalysis,
      githubProfile,
      dbActivities,
      readinessHistoryDocs,
    ] = await Promise.all([
      UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] }),
      Skill.find(userQuery),
      Project.find(userQuery),
      JobApplication.find(userQuery),
      InterviewSession.find(userQuery),
      Roadmap.findOne(userQuery),
      ResumeAnalysis.findOne(userQuery).sort({ createdAt: -1 }),
      GitHubProfile.findOne(userQuery),
      Activity.find(userQuery).sort({ createdAt: -1 }).limit(10),
      ReadinessHistory.find({ clerkUserId: userId }).sort({ createdAt: 1 }).limit(30),
    ]);

    // 2. SKILLS ANALYTICS
    const totalSkills = skills.length;
    const masteredSkills = skills.filter((s) => s.learningStatus === 'Mastered' || s.proficiency === 'Expert' || s.proficiency === 'Advanced').length;
    
    const skillScores = skills.map((s) => getSkillNumericScore(s.proficiency));
    const avgSkillProficiency =
      totalSkills > 0
        ? Math.round(skillScores.reduce((acc, score) => acc + score, 0) / totalSkills)
        : null;

    // Group skills by category
    const skillCategoryMap: Record<string, { total: number; sumProficiency: number }> = {};
    skills.forEach((s) => {
      const cat = s.category || 'General';
      const score = getSkillNumericScore(s.proficiency);
      if (!skillCategoryMap[cat]) {
        skillCategoryMap[cat] = { total: 0, sumProficiency: 0 };
      }
      skillCategoryMap[cat].total += 1;
      skillCategoryMap[cat].sumProficiency += score;
    });

    const categoryBreakdown = Object.entries(skillCategoryMap).map(([category, val]) => ({
      category,
      count: val.total,
      avgProficiency: Math.round(val.sumProficiency / val.total),
    }));

    // 3. ROADMAP ANALYTICS
    let totalRoadmapTasks = 0;
    let completedRoadmapTasks = 0;
    let totalLearningHours = 0;
    const phaseProgress: Array<{ phase: string; completed: number; total: number; percentage: number }> = [];

    if (roadmap && Array.isArray(roadmap.phases)) {
      roadmap.phases.forEach((phase) => {
        const phaseItems = phase.items || [];
        const phaseTotal = phaseItems.length;
        const phaseCompleted = phaseItems.filter((item) => item.completed).length;

        totalRoadmapTasks += phaseTotal;
        completedRoadmapTasks += phaseCompleted;

        phaseItems.forEach((item) => {
          if (item.completed && item.estimatedHours) {
            totalLearningHours += item.estimatedHours;
          }
        });

        if (phaseTotal > 0) {
          phaseProgress.push({
            phase: phase.title || 'Phase',
            completed: phaseCompleted,
            total: phaseTotal,
            percentage: Math.round((phaseCompleted / phaseTotal) * 100),
          });
        }
      });
    }

    const roadmapCompletionPercentage =
      totalRoadmapTasks > 0 ? Math.round((completedRoadmapTasks / totalRoadmapTasks) * 100) : 0;

    // 4. INTERVIEWS ANALYTICS
    const totalInterviews = interviews.length;
    const avgInterviewScore =
      totalInterviews > 0
        ? Math.round(interviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / totalInterviews)
        : null;
    const bestInterviewScore =
      totalInterviews > 0 ? Math.max(...interviews.map((i) => i.overallScore || 0)) : null;

    // Interview performance by category
    const interviewCategoryMap: Record<string, { total: number; sumScore: number }> = {};
    interviews.forEach((i) => {
      const cat = i.category || 'General';
      if (!interviewCategoryMap[cat]) {
        interviewCategoryMap[cat] = { total: 0, sumScore: 0 };
      }
      interviewCategoryMap[cat].total += 1;
      interviewCategoryMap[cat].sumScore += i.overallScore || 0;
    });

    const interviewPerformance = Object.entries(interviewCategoryMap).map(([category, val]) => ({
      category,
      score: Math.round(val.sumScore / val.total),
      count: val.total,
    }));

    // 5. PROJECTS ANALYTICS
    const totalProjects = projects.length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;
    const inProgressProjects = projects.filter((p) => p.status === 'In Progress').length;
    const planningProjects = projects.filter((p) => p.status === 'Planning').length;
    const ideaProjects = projects.filter((p) => p.status === 'Idea').length;

    // 6. JOBS ANALYTICS
    const totalJobs = jobs.length;
    const savedJobs = jobs.filter((j) => j.status === 'Saved').length;
    const appliedJobs = jobs.filter((j) => j.status === 'Applied').length;
    const assessmentJobs = jobs.filter((j) => j.status === 'Assessment').length;
    const interviewJobs = jobs.filter((j) => j.status === 'Interview').length;
    const offerJobs = jobs.filter((j) => j.status === 'Offer').length;
    const rejectedJobs = jobs.filter((j) => j.status === 'Rejected').length;
    const withdrawnJobs = jobs.filter((j) => j.status === 'Withdrawn').length;

    const submittedJobs = appliedJobs + assessmentJobs + interviewJobs + offerJobs + rejectedJobs;
    const responseRate =
      submittedJobs > 0 ? Math.round(((assessmentJobs + interviewJobs + offerJobs) / submittedJobs) * 100) : null;
    const offerRate = submittedJobs > 0 ? Math.round((offerJobs / submittedJobs) * 100) : null;

    // 7. CAREER READINESS SCORE COMPUTATION
    const skillsScore = avgSkillProficiency || 0;
    const resumeScore = resumeAnalysis?.atsScore || 0;
    const githubScore = githubProfile
      ? (githubProfile.score || Math.min(100, (githubProfile.publicRepos * 5) + (githubProfile.followers * 10)))
      : 0;
    const projectsScore =
      totalProjects > 0
        ? Math.round(((completedProjects * 100 + inProgressProjects * 50) / (totalProjects * 100)) * 100)
        : 0;
    const interviewScore = avgInterviewScore || 0;
    const learningScore = roadmapCompletionPercentage;

    const activeScores = [
      skillsScore,
      resumeScore,
      githubScore,
      projectsScore,
      interviewScore,
      learningScore,
    ].filter((s) => s > 0);

    const calculatedReadinessScore =
      activeScores.length > 0
        ? Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length)
        : null;

    // Persist readiness score history snapshot if calculated score exists
    let historyPoints = readinessHistoryDocs.map((doc) => ({
      date: new Date(doc.createdAt).toISOString().split('T')[0],
      overallScore: doc.overallScore,
      skillsScore: doc.skillsScore,
      resumeScore: doc.resumeScore,
      githubScore: doc.githubScore,
      projectsScore: doc.projectsScore,
      interviewScore: doc.interviewScore,
      learningScore: doc.learningScore,
    }));

    if (calculatedReadinessScore !== null) {
      const todayStr = new Date().toISOString().split('T')[0];
      const hasTodaySnapshot = historyPoints.some((hp) => hp.date === todayStr);

      if (!hasTodaySnapshot) {
        try {
          const newHistory = await ReadinessHistory.create({
            clerkUserId: userId,
            overallScore: calculatedReadinessScore,
            skillsScore,
            resumeScore,
            githubScore,
            projectsScore,
            interviewScore,
            learningScore,
          });

          historyPoints.push({
            date: todayStr,
            overallScore: newHistory.overallScore,
            skillsScore: newHistory.skillsScore,
            resumeScore: newHistory.resumeScore,
            githubScore: newHistory.githubScore,
            projectsScore: newHistory.projectsScore,
            interviewScore: newHistory.interviewScore,
            learningScore: newHistory.learningScore,
          });
        } catch (histErr) {
          console.warn('[AnalyticsController] Readiness history save note:', histErr);
        }
      }

      // Update UserProfile readinessScore in DB
      if (profile && profile.readinessScore !== calculatedReadinessScore) {
        profile.readinessScore = calculatedReadinessScore;
        await profile.save().catch(() => {});
      }
    }

    // 8. REAL ACTIVITY TIMELINE AGGREGATION
    const realActivities: Array<{ id: string; type: string; title: string; description: string; timestamp: Date }> = [];

    // Add DB Activity entries
    dbActivities.forEach((act: any) => {
      realActivities.push({
        id: act._id.toString(),
        type: act.type || 'activity',
        title: act.title || 'User Activity',
        description: act.description || '',
        timestamp: act.createdAt || new Date(),
      });
    });

    // Add Skills events
    skills.slice(0, 5).forEach((s: any) => {
      realActivities.push({
        id: `skill_${s._id}`,
        type: 'skill_added',
        title: `Skill Recorded: ${s.name}`,
        description: `Proficiency: ${s.proficiency} (${s.category || 'General'})`,
        timestamp: s.createdAt || new Date(),
      });
    });

    // Add Project events
    projects.slice(0, 5).forEach((p: any) => {
      realActivities.push({
        id: `project_${p._id}`,
        type: 'project_updated',
        title: `Project: ${p.title}`,
        description: `Status updated to ${p.status}`,
        timestamp: p.updatedAt || p.createdAt || new Date(),
      });
    });

    // Add Interview events
    interviews.slice(0, 5).forEach((i: any) => {
      realActivities.push({
        id: `interview_${i._id}`,
        type: 'interview_completed',
        title: `${i.category} Interview Session`,
        description: `Evaluated score: ${i.overallScore}% (${i.mode || 'Practice'})`,
        timestamp: i.createdAt || new Date(),
      });
    });

    // Add Job Application events
    jobs.slice(0, 5).forEach((j: any) => {
      realActivities.push({
        id: `job_${j._id}`,
        type: 'job_applied',
        title: `Job Application: ${j.position} at ${j.company}`,
        description: `Current status: ${j.status}`,
        timestamp: j.updatedAt || j.createdAt || new Date(),
      });
    });

    // Sort activities by timestamp descending & take top 10 unique
    const sortedActivities = realActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // 9. RETURN COMPLETE AGGREGATED ANALYTICS PAYLOAD
    res.json({
      success: true,
      analytics: {
        readinessScore: {
          current: calculatedReadinessScore,
          breakdown: {
            skillsScore,
            resumeScore,
            githubScore,
            projectsScore,
            interviewScore,
            learningScore,
          },
          history: historyPoints,
        },
        skills: {
          total: totalSkills,
          mastered: masteredSkills,
          averageProficiency: avgSkillProficiency,
          categoryBreakdown,
        },
        roadmap: {
          totalTasks: totalRoadmapTasks,
          completedTasks: completedRoadmapTasks,
          completionPercentage: roadmapCompletionPercentage,
          learningHours: totalLearningHours,
          progress: phaseProgress,
        },
        interviews: {
          totalSessions: totalInterviews,
          averageScore: avgInterviewScore,
          bestScore: bestInterviewScore,
          performance: interviewPerformance,
        },
        projects: {
          total: totalProjects,
          completed: completedProjects,
          inProgress: inProgressProjects,
          planning: planningProjects,
          ideas: ideaProjects,
        },
        jobs: {
          totalApplications: totalJobs,
          saved: savedJobs,
          applied: appliedJobs,
          assessment: assessmentJobs,
          interview: interviewJobs,
          offer: offerJobs,
          rejected: rejectedJobs,
          withdrawn: withdrawnJobs,
          responseRate,
          offerRate,
        },
        activity: sortedActivities,
      },
    });
  } catch (error: any) {
    console.error('[Analytics Error]', error);
    res.json({
      success: true,
      analytics: emptyAnalyticsPayload,
    });
  }
};
