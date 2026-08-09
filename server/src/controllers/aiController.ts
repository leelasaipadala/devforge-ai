import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AIConversation } from '../models/AIConversation.js';
import { UserProfile } from '../models/UserProfile.js';
import { Skill } from '../models/Skill.js';
import { Project } from '../models/Project.js';
import { GeminiService } from '../services/geminiService.js';
import { isMongoConnected } from '../config/db.js';

const memoryChats = new Map<string, any[]>();

export const chatWithCoach = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Message content is required' });
      return;
    }

    console.log('[FORGE AI] Current user message:', message);
    console.log('[FORGE AI] Conversation ID:', conversationId || 'new');

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

    console.log('[FORGE AI] Response generated successfully');

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
    console.error('[FORGE AI Error]:', error?.message || error);
    const errMsg = error?.message && error.message.includes('temporarily unavailable')
      ? 'FORGE AI is temporarily unavailable. Please try again.'
      : error?.message || 'FORGE AI is temporarily unavailable. Please try again.';

    res.status(500).json({ success: false, message: errMsg });
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
