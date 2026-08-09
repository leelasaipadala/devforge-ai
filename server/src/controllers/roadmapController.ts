import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Roadmap } from '../models/Roadmap.js';
import { UserProfile } from '../models/UserProfile.js';
import { Skill } from '../models/Skill.js';
import { GeminiService } from '../services/geminiService.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

// Memory store fallback
const memoryRoadmaps = new Map<string, any>();

export const getRoadmap = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authenticated user ID is required.' });
      return;
    }

    let roadmap: any = null;

    if (isMongoConnected) {
      roadmap = await Roadmap.findOne({ userId });
    } else {
      roadmap = memoryRoadmaps.get(userId);
    }

    // If no roadmap exists for user, auto-generate a valid roadmap or return null safely
    if (!roadmap) {
      let targetRole = 'Full Stack Developer';
      if (isMongoConnected) {
        const profile = await UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] });
        if (profile && profile.targetRole) {
          targetRole = profile.targetRole;
        }
      }

      const generatedData = await GeminiService.generateCustomRoadmap(targetRole, []);
      const completeRoadmapDoc = {
        ...generatedData,
        userId,
        targetRole,
        title: generatedData.title || `Mastering ${targetRole}`,
      };

      if (isMongoConnected) {
        roadmap = await Roadmap.create(completeRoadmapDoc);
      } else {
        roadmap = completeRoadmapDoc;
        memoryRoadmaps.set(userId, roadmap);
      }
    }

    res.json({ success: true, roadmap });
  } catch (error: any) {
    console.error('[Roadmap API Error]', error?.stack || error);
    res.status(500).json({
      success: false,
      message: 'Unable to load roadmap due to a server error.',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
};

export const generateRoadmap = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authenticated user ID is required.' });
      return;
    }

    let targetRole = req.body.targetRole;
    let currentSkillNames: string[] = [];

    if (isMongoConnected) {
      const profile = await UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] });
      if (!targetRole && profile) targetRole = profile.targetRole;
      const skills = await Skill.find({ userId });
      currentSkillNames = skills.map((s) => s.name);
    }

    targetRole = targetRole || 'Full Stack Developer';

    const generatedData = await GeminiService.generateCustomRoadmap(targetRole, currentSkillNames);
    const completeRoadmapDoc = {
      ...generatedData,
      userId,
      targetRole,
      title: generatedData.title || `Mastering ${targetRole}`,
    };

    let roadmap: any = null;

    if (isMongoConnected) {
      await Roadmap.deleteMany({ userId });
      roadmap = await Roadmap.create(completeRoadmapDoc);
      await Activity.create({
        userId,
        type: 'roadmap',
        title: 'Generated AI Career Roadmap',
        description: `Target role: ${targetRole}`,
      });
    } else {
      roadmap = completeRoadmapDoc;
      memoryRoadmaps.set(userId, roadmap);
    }

    res.json({ success: true, roadmap, message: 'New roadmap generated successfully' });
  } catch (error: any) {
    console.error('[Generate Roadmap API Error]', error?.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error generating new career roadmap',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
};

export const toggleRoadmapItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { phaseId, itemId, completed } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authenticated user ID is required.' });
      return;
    }

    let roadmap: any = null;

    if (isMongoConnected) {
      roadmap = await Roadmap.findOne({ userId });
      if (roadmap) {
        const phase = roadmap.phases.find((p: any) => p.id === phaseId);
        if (phase) {
          const item = phase.items.find((i: any) => i.id === itemId);
          if (item) {
            item.completed = completed;
            const completedCount = phase.items.filter((i: any) => i.completed).length;
            phase.completion = phase.items.length > 0 ? Math.round((completedCount / phase.items.length) * 100) : 0;
            if (phase.completion === 100) phase.status = 'Completed';
            else if (phase.completion > 0) phase.status = 'In Progress';
            else phase.status = 'Not Started';
          }
        }
        await roadmap.save();
      }
    } else {
      roadmap = memoryRoadmaps.get(userId);
      if (roadmap) {
        const phase = roadmap.phases.find((p: any) => p.id === phaseId);
        if (phase) {
          const item = phase.items.find((i: any) => i.id === itemId);
          if (item) {
            item.completed = completed;
            const completedCount = phase.items.filter((i: any) => i.completed).length;
            phase.completion = phase.items.length > 0 ? Math.round((completedCount / phase.items.length) * 100) : 0;
          }
        }
        memoryRoadmaps.set(userId, roadmap);
      }
    }

    res.json({ success: true, roadmap });
  } catch (error: any) {
    console.error('[Toggle Roadmap API Error]', error?.stack || error);
    res.status(500).json({ success: false, message: 'Error updating roadmap item status' });
  }
};
