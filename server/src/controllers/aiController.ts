import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AIConversation } from '../models/AIConversation.js';
import { UserProfile } from '../models/UserProfile.js';
import { Skill } from '../models/Skill.js';
import { Project } from '../models/Project.js';
import { GeminiService } from '../services/geminiService.js';
import { isMongoConnected } from '../config/db.js';

const memoryChats = new Map<string, any[]>();

/**
 * Public AI Health Check Endpoint (GET /api/ai/health)
 */
export const getAiHealth = async (_req: Request, res: Response): Promise<void> => {
  const isConfigured = GeminiService.isConfigured();
  res.json({
    success: true,
    configured: isConfigured,
    provider: 'FORGE AI',
  });
};

export const chatWithCoach = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        code: 'INVALID_REQUEST',
        message: 'Message content is required',
      });
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[FORGE AI] Current user message:', message.slice(0, 80));
      console.log('[FORGE AI] Conversation ID:', conversationId || 'new');
    }

    // Load user context selectively
    let userContext: any = {
      name: req.userName || 'Developer',
      targetRole: 'Full Stack Developer',
      careerGoal: 'Land a Software Engineer Position',
      experienceLevel: 'Intermediate',
      skills: ['JavaScript', 'React', 'Node.js'],
      readinessScore: 50,
      githubProfile: { connected: false },
      resume: { uploaded: false },
      projects: { count: 0, titles: [] },
    };

    let history: { role: string; content: string }[] = [];

    if (isMongoConnected) {
      const profile = await UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] });
      if (profile) {
        userContext.name = profile.name || userContext.name;
        userContext.targetRole = profile.targetRole || userContext.targetRole;
        userContext.careerGoal = profile.careerGoal || userContext.careerGoal;
        userContext.experienceLevel = profile.experienceLevel || userContext.experienceLevel;
        userContext.readinessScore = profile.readinessScore || 50;
        if (profile.githubUsername) {
          userContext.githubProfile = { connected: true, username: profile.githubUsername };
        }
      }

      const userSkills = await Skill.find({ userId });
      if (userSkills.length > 0) {
        userContext.skills = userSkills.map((s) => s.name);
      }

      const userProjects = await Project.find({ userId });
      if (userProjects.length > 0) {
        userContext.projects = { count: userProjects.length, titles: userProjects.map((p) => p.title) };
      }

      // Query conversation history
      let conversation: any = null;
      if (conversationId) {
        conversation = await AIConversation.findOne({ _id: conversationId, userId });
      } else {
        conversation = await AIConversation.findOne({ userId }).sort({ updatedAt: -1 });
      }

      if (conversation) {
        history = conversation.messages.map((m: any) => ({ role: m.role, content: m.content }));
      }
    } else {
      const chat = memoryChats.get(`${userId}-${conversationId || 'default'}`) || [];
      history = chat.map((m: any) => ({ role: m.role, content: m.content }));
    }

    // Call FORGE AI Gemini Service
    const aiResponseText = await GeminiService.chatWithCareerCoach({
      message: message.trim(),
      conversationHistory: history,
      userContext,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[FORGE AI] Response generated successfully');
    }

    const userMsg = { id: `msg-${Date.now()}-1`, role: 'user' as const, content: message.trim(), timestamp: new Date() };
    const assistantMsg = { id: `msg-${Date.now()}-2`, role: 'assistant' as const, content: aiResponseText, timestamp: new Date() };

    let activeConversation: any = null;

    if (isMongoConnected) {
      if (conversationId) {
        activeConversation = await AIConversation.findOne({ _id: conversationId, userId });
      }
      if (!activeConversation) {
        activeConversation = await AIConversation.create({
          userId,
          title: message.trim().slice(0, 30),
          messages: [userMsg, assistantMsg],
        });
      } else {
        activeConversation.messages.push(userMsg, assistantMsg);
        await activeConversation.save();
      }
    } else {
      const chatKey = `${userId}-${conversationId || 'default'}`;
      const chat = memoryChats.get(chatKey) || [];
      chat.push(userMsg, assistantMsg);
      memoryChats.set(chatKey, chat);
      activeConversation = { _id: conversationId || `conv-${Date.now()}`, messages: chat };
    }

    res.json({
      success: true,
      reply: aiResponseText,
      conversationId: activeConversation._id ? activeConversation._id.toString() : conversationId,
      messages: activeConversation.messages,
    });
  } catch (error: any) {
    const code = error?.code || 'GEMINI_ERROR';
    const status = error?.status || 500;
    const message = error?.message || 'FORGE AI could not complete this request. Please try again.';

    if (process.env.NODE_ENV === 'development') {
      console.error('[FORGE AI ERROR]', { code, status, message });
    }

    res.status(status).json({
      success: false,
      code,
      message,
    });
  }
};

export const getConversationHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const conversationId = req.query.conversationId as string;
    let messages: any[] = [];

    if (isMongoConnected) {
      let conversation: any = null;
      if (conversationId) {
        conversation = await AIConversation.findOne({ _id: conversationId, userId });
      } else {
        conversation = await AIConversation.findOne({ userId }).sort({ updatedAt: -1 });
      }
      if (conversation) messages = conversation.messages;
    } else {
      messages = memoryChats.get(`${userId}-${conversationId || 'default'}`) || [];
    }

    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching chat history' });
  }
};

export const clearConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const conversationId = req.query.conversationId as string;

    if (isMongoConnected) {
      if (conversationId) {
        await AIConversation.deleteOne({ _id: conversationId, userId });
      } else {
        await AIConversation.deleteMany({ userId });
      }
    } else {
      if (conversationId) {
        memoryChats.delete(`${userId}-${conversationId}`);
      } else {
        memoryChats.clear();
      }
    }

    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error clearing conversation' });
  }
};
