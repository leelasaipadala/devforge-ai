import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Skill } from '../models/Skill.js';
import { UserProfile } from '../models/UserProfile.js';
import { CareerReadinessService } from '../services/careerReadinessService.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

// Fallback in-memory store
const memorySkills = new Map<string, any[]>();

export const getSkills = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let skills: any[] = [];

    if (isMongoConnected) {
      skills = await Skill.find({ userId }).sort({ createdAt: -1 });
    } else {
      skills = memorySkills.get(userId) || [];
    }

    res.json({ success: true, skills });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching skills' });
  }
};

export const addSkill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, category, proficiency, learningStatus, notes } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Skill name is required' });
      return;
    }

    const skillData = {
      userId,
      name,
      category: category || 'Programming',
      proficiency: proficiency || 'Beginner',
      learningStatus: learningStatus || 'To Learn',
      notes: notes || '',
    };

    let skill: any = null;

    if (isMongoConnected) {
      skill = await Skill.create(skillData);
      await Activity.create({
        userId,
        type: 'skill',
        title: `Added Skill: ${name}`,
        description: `Proficiency: ${skillData.proficiency}`,
      });
    } else {
      const existing = memorySkills.get(userId) || [];
      skill = { ...skillData, _id: `sk-${Date.now()}` };
      existing.unshift(skill);
      memorySkills.set(userId, existing);
    }

    res.status(201).json({ success: true, skill });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error adding skill' });
  }
};

export const updateSkill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updates = req.body;

    let skill: any = null;

    if (isMongoConnected) {
      skill = await Skill.findOneAndUpdate({ _id: id, userId }, { $set: updates }, { new: true });
    } else {
      const existing = memorySkills.get(userId) || [];
      const idx = existing.findIndex((s) => s._id === id);
      if (idx !== -1) {
        existing[idx] = { ...existing[idx], ...updates };
        skill = existing[idx];
        memorySkills.set(userId, existing);
      }
    }

    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found' });
      return;
    }

    res.json({ success: true, skill });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating skill' });
  }
};

export const deleteSkill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    if (isMongoConnected) {
      await Skill.findOneAndDelete({ _id: id, userId });
    } else {
      const existing = memorySkills.get(userId) || [];
      const filtered = existing.filter((s) => s._id !== id);
      memorySkills.set(userId, filtered);
    }

    res.json({ success: true, message: 'Skill removed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error deleting skill' });
  }
};

export const getSkillGapAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    let targetRole = 'Full Stack Developer';
    let userSkills: any[] = [];

    if (isMongoConnected) {
      const profile = await UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] });
      if (profile) targetRole = profile.targetRole;
      userSkills = await Skill.find({ userId });
    } else {
      userSkills = memorySkills.get(userId) || [];
    }

    const requiredSkills = CareerReadinessService.ROLE_BENCHMARKS[targetRole] || CareerReadinessService.ROLE_BENCHMARKS['Full Stack Developer'];
    const userSkillMap = new Map<string, string>();
    userSkills.forEach((s) => userSkillMap.set(s.name.toLowerCase(), s.proficiency));

    const acquired: { name: string; proficiency: string }[] = [];
    const missing: { name: string; priority: 'High' | 'Medium' | 'Low'; rationale: string }[] = [];

    requiredSkills.forEach((reqSkill) => {
      const prof = userSkillMap.get(reqSkill.toLowerCase());
      if (prof) {
        acquired.push({ name: reqSkill, proficiency: prof });
      } else {
        const isCore = ['JavaScript', 'TypeScript', 'Node.js', 'React', 'SQL', 'Python', 'Git', 'Docker'].includes(reqSkill);
        missing.push({
          name: reqSkill,
          priority: isCore ? 'High' : 'Medium',
          rationale: `Essential competency for standard ${targetRole} positions.`,
        });
      }
    });

    const completionPercentage = requiredSkills.length > 0 ? Math.round((acquired.length / requiredSkills.length) * 100) : 0;

    res.json({
      success: true,
      targetRole,
      acquired,
      missing,
      completionPercentage,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error analyzing skill gap' });
  }
};
