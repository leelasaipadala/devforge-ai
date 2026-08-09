import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Project } from '../models/Project.js';
import { UserProfile } from '../models/UserProfile.js';
import { Skill } from '../models/Skill.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

const memoryProjects = new Map<string, any[]>();

export const getProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let projects: any[] = [];

    if (isMongoConnected) {
      projects = await Project.find({ userId }).sort({ createdAt: -1 });
    } else {
      projects = memoryProjects.get(userId) || [];
    }

    res.json({ success: true, projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching projects' });
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { title, description, technologies, githubUrl, liveUrl, status, startDate, endDate, skills, difficulty, category } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Project title is required' });
      return;
    }

    const projectData = {
      userId,
      title,
      description: description || '',
      technologies: Array.isArray(technologies) ? technologies : ['TypeScript'],
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      status: status || 'In Progress',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      skills: Array.isArray(skills) ? skills : [],
      difficulty: difficulty || 'Intermediate',
      category: category || 'Web Application',
    };

    let project: any = null;

    if (isMongoConnected) {
      project = await Project.create(projectData);
      await Activity.create({
        userId,
        type: 'project',
        title: `Created Project: ${title}`,
        description: `Status: ${projectData.status}`,
      });
    } else {
      project = { ...projectData, _id: `proj-${Date.now()}` };
      const existing = memoryProjects.get(userId) || [];
      existing.unshift(project);
      memoryProjects.set(userId, existing);
    }

    res.status(201).json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error creating project' });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updates = req.body;

    let project: any = null;

    if (isMongoConnected) {
      project = await Project.findOneAndUpdate({ _id: id, userId }, { $set: updates }, { new: true });
    } else {
      const existing = memoryProjects.get(userId) || [];
      const idx = existing.findIndex((p) => p._id === id);
      if (idx !== -1) {
        existing[idx] = { ...existing[idx], ...updates };
        project = existing[idx];
        memoryProjects.set(userId, existing);
      }
    }

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating project' });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    if (isMongoConnected) {
      await Project.findOneAndDelete({ _id: id, userId });
    } else {
      const existing = memoryProjects.get(userId) || [];
      const filtered = existing.filter((p) => p._id !== id);
      memoryProjects.set(userId, filtered);
    }

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error deleting project' });
  }
};

export const getAIProjectIdeas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let targetRole = 'Full Stack Developer';
    let experienceLevel = 'Intermediate';
    let skills: string[] = [];
    let existingProjects: { title: string }[] = [];
    let githubRepos: { name: string; language: string }[] = [];

    const { GeminiService } = await import('../services/geminiService.js');
    const { GitHubProfile } = await import('../models/GitHubProfile.js');

    if (isMongoConnected) {
      const profile = await UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] });
      if (profile) {
        targetRole = profile.targetRole || 'Full Stack Developer';
        experienceLevel = profile.experienceLevel || 'Intermediate';
      }

      const userSkills = await Skill.find({ userId });
      skills = userSkills.map((s) => s.name);

      const projects = await Project.find({ userId });
      existingProjects = projects.map((p) => ({ title: p.title }));

      const ghProf = await GitHubProfile.findOne({ userId });
      if (ghProf && Array.isArray(ghProf.repositories)) {
        githubRepos = ghProf.repositories.map((r: any) => ({ name: r.name, language: r.language }));
      }
    }

    const skillGaps = ['System Design', 'Docker Containerization', 'Microservices Architecture', 'CI/CD Pipelines'];

    const recommendations = await GeminiService.generateProjectRecommendations({
      targetRole,
      experienceLevel,
      skills,
      skillGaps,
      existingProjects,
      githubRepos,
    });

    res.json({ success: true, ideas: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching AI project recommendations' });
  }
};
