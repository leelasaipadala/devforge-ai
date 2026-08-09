import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AIConversation } from '../models/AIConversation.js';
import { UserProfile } from '../models/UserProfile.js';
import { Skill } from '../models/Skill.js';
import { GeminiService } from '../services/geminiService.js';
import { isMongoConnected } from '../config/db.js';

const memoryChats = new Map<string, any[]>();

export const chatWithCoach = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message content is required' });
      return;
    }

    // Load user context for Gemini API prompt
    let userContext = {
      name: req.userName || 'Developer',
      targetRole: 'Full Stack Developer',
      careerGoal: 'Land a Software Engineer Role',
      experienceLevel: 'Beginner',
      skills: ['JavaScript', 'React', 'Node.js'],
      readinessScore: 50,
    };

    let history: { role: string; content: string }[] = [];

    if (isMongoConnected) {
      const profile = await UserProfile.findOne({ $or: [{ clerkUserId: userId }, { clerkId: userId }] });
      if (profile) {
        userContext.name = profile.name;
        userContext.targetRole = profile.targetRole;
        userContext.careerGoal = profile.careerGoal;
        userContext.experienceLevel = profile.experienceLevel;
        userContext.readinessScore = profile.readinessScore || 50;
      }
      const skills = await Skill.find({ userId });
      if (skills.length > 0) userContext.skills = skills.map((s) => s.name);

      const conversation = await AIConversation.findOne({ userId }).sort({ updatedAt: -1 });
      if (conversation) {
        history = conversation.messages.map((m) => ({ role: m.role, content: m.content }));
      }
    } else {
      const chat = memoryChats.get(userId) || [];
      history = chat.map((m) => ({ role: m.role, content: m.content }));
    }

    // Get response from Gemini AI Service
    const aiResponseText = await GeminiService.chatWithCareerCoach({
      message,
      conversationHistory: history,
      userContext,
    });

    const userMsg = { id: `msg-${Date.now()}-1`, role: 'user' as const, content: message, timestamp: new Date() };
    const assistantMsg = { id: `msg-${Date.now()}-2`, role: 'assistant' as const, content: aiResponseText, timestamp: new Date() };

    let conversation: any = null;

    if (isMongoConnected) {
      conversation = await AIConversation.findOne({ userId });
      if (!conversation) {
        conversation = await AIConversation.create({
          userId,
          title: 'Career Strategy Session',
          messages: [userMsg, assistantMsg],
        });
      } else {
        conversation.messages.push(userMsg, assistantMsg);
        await conversation.save();
      }
    } else {
      const chat = memoryChats.get(userId) || [];
      chat.push(userMsg, assistantMsg);
      memoryChats.set(userId, chat);
      conversation = { messages: chat };
    }

    res.json({
      success: true,
      reply: aiResponseText,
      messages: conversation.messages,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error processing AI response' });
  }
};

export const getConversationHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let messages: any[] = [];

    if (isMongoConnected) {
      const conversation = await AIConversation.findOne({ userId });
      if (conversation) messages = conversation.messages;
    } else {
      messages = memoryChats.get(userId) || [];
    }

    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching chat history' });
  }
};

export const clearConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    if (isMongoConnected) {
      await AIConversation.deleteMany({ userId });
    } else {
      memoryChats.delete(userId);
    }

    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error clearing conversation' });
  }
};
