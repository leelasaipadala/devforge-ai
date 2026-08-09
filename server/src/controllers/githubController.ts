import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { GitHubProfile } from '../models/GitHubProfile.js';
import { UserProfile } from '../models/UserProfile.js';
import { GitHubService } from '../services/githubService.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

const memoryGitHub = new Map<string, any>();

export const analyzeGitHubProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let username = (req.query.username as string) || (req.body.username as string);
    const userToken = req.headers['x-github-token'] as string;

    if (!username && isMongoConnected) {
      const userProf = await UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] });
      if (userProf && userProf.githubUsername) {
        username = userProf.githubUsername;
      }
    }

    if (!username) {
      res.status(400).json({ success: false, message: 'GitHub username is required to analyze profile.' });
      return;
    }

    const githubData = await GitHubService.analyzeProfile(username, userToken);
    githubData.userId = userId;

    let profileDoc: any = null;

    if (isMongoConnected) {
      profileDoc = await GitHubProfile.findOneAndUpdate({ userId }, { $set: githubData }, { new: true, upsert: true });
      await UserProfile.findOneAndUpdate({ $or: [{ clerkUserId: userId }, { clerkId: userId }] }, { $set: { githubUsername: username } });

      await Activity.create({
        userId,
        type: 'github',
        title: `Analyzed GitHub Profile (@${username})`,
        description: `GitHub Quality Score: ${githubData.score}%`,
      });
    } else {
      profileDoc = githubData;
      memoryGitHub.set(userId, profileDoc);
    }

    res.json({
      success: true,
      githubProfile: profileDoc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error analyzing GitHub profile' });
  }
};

export const getGitHubProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let profileDoc: any = null;

    if (isMongoConnected) {
      const doc = await GitHubProfile.findOne({ userId });
      if (doc) {
        profileDoc = doc.toObject ? doc.toObject() : { ...doc };
        const { Project } = await import('../models/Project.js');
        const userProjects = await Project.find({ userId });
        const importedUrls = new Set(userProjects.map((p) => p.githubUrl).filter(Boolean));
        const importedTitles = new Set(userProjects.map((p) => p.title.toLowerCase()));

        if (Array.isArray(profileDoc.repositories)) {
          profileDoc.repositories = profileDoc.repositories.map((repo: any) => ({
            ...repo,
            isImported: importedUrls.has(repo.url) || importedTitles.has(repo.name.toLowerCase()),
          }));
        }
      }
    } else {
      profileDoc = memoryGitHub.get(userId);
    }

    res.json({ success: true, githubProfile: profileDoc || null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching GitHub profile' });
  }
};

export const importToProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { repositories } = req.body;

    if (!Array.isArray(repositories) || repositories.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide array of repositories to import' });
      return;
    }

    const { Project } = await import('../models/Project.js');

    const importedProjects = [];

    for (const repo of repositories) {
      const projectData = {
        userId,
        title: repo.name || 'GitHub Repository',
        description: repo.description || 'Imported GitHub Repository',
        technologies: repo.language ? [repo.language] : ['TypeScript'],
        githubUrl: repo.html_url || repo.githubUrl || '',
        liveUrl: repo.homepage || '',
        status: 'Completed',
        startDate: repo.created_at ? new Date(repo.created_at) : new Date(),
        endDate: repo.pushed_at ? new Date(repo.pushed_at) : new Date(),
        skills: repo.language ? [repo.language] : ['Software Engineering'],
        difficulty: 'Intermediate',
        category: 'GitHub Import',
      };

      if (isMongoConnected) {
        const existing = await Project.findOne({ userId, $or: [{ githubUrl: projectData.githubUrl }, { title: projectData.title }] });
        if (!existing) {
          const created = await Project.create(projectData);
          importedProjects.push(created);
        } else {
          importedProjects.push(existing);
        }
      } else {
        const fakeProj = { ...projectData, _id: `proj-gh-${Date.now()}-${Math.random()}` };
        importedProjects.push(fakeProj);
      }
    }

    await Activity.create({
      userId,
      type: 'github',
      title: `Imported ${importedProjects.length} GitHub Repositories`,
      description: `Created DevForge Portfolio Projects for: ${repositories.map((r: any) => r.name).join(', ')}`,
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${importedProjects.length} repositories to DevForge Projects`,
      importedProjects,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error importing repositories to projects' });
  }
};

