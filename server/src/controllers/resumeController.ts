import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ResumeAnalysis } from '../models/ResumeAnalysis.js';
import { UserProfile } from '../models/UserProfile.js';
import { ResumeParserService } from '../services/resumeParserService.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

const memoryResumes = new Map<string, any[]>();

export const analyzeResume = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const file = req.file;
    const { rawText, jobDescription, targetRoleOverride } = req.body;

    let targetRole = targetRoleOverride || 'Full Stack Developer';
    let profileContext: any = null;

    if (isMongoConnected) {
      const profile = await UserProfile.findOne({ clerkId: userId });
      if (profile) {
        profileContext = profile;
        if (!targetRoleOverride) targetRole = profile.targetRole;
      }
    }

    const fileName = file ? file.originalname : 'uploaded_resume.pdf';
    const fileSize = file ? file.size : 0;
    const fileBuffer = file ? file.buffer : undefined;

    const analysisResult = await ResumeParserService.analyzeResume(
      fileBuffer,
      targetRole,
      rawText,
      jobDescription,
      profileContext
    );

    const docData = {
      userId,
      fileName,
      fileSize,
      ...analysisResult,
    };

    let savedAnalysis: any = null;

    if (isMongoConnected) {
      savedAnalysis = await ResumeAnalysis.create(docData);
      await Activity.create({
        userId,
        type: 'resume',
        title: `Analyzed Resume (${fileName})`,
        description: `ATS Score: ${analysisResult.atsScore}%`,
      });
    } else {
      savedAnalysis = { ...docData, _id: `res-${Date.now()}`, createdAt: new Date() };
      const existing = memoryResumes.get(userId) || [];
      existing.unshift(savedAnalysis);
      memoryResumes.set(userId, existing);
    }

    res.status(201).json({
      success: true,
      analysis: savedAnalysis,
      message: 'Resume analyzed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error analyzing resume' });
  }
};

export const getResumeHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let history: any[] = [];

    if (isMongoConnected) {
      history = await ResumeAnalysis.find({ userId }).sort({ createdAt: -1 });
    } else {
      history = memoryResumes.get(userId) || [];
    }

    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching resume history' });
  }
};
