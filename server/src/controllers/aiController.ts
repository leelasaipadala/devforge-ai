import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AIConversation } from '../models/AIConversation.js';
import { AiContextService } from '../services/aiContextService.js';
import { AiPromptService } from '../services/aiPromptService.js';
import { GeminiService } from '../services/geminiService.js';
import { AiResponseService } from '../services/aiResponseService.js';
import { isMongoConnected } from '../config/db.js';

const memoryChats = new Map<string, any[]>();

/**
 * AI Status & Health Endpoint (GET /api/ai/status & GET /api/ai/health)
 */
export const getAiStatus = async (_req: Request, res: Response): Promise<void> => {
  res.json(GeminiService.getStatus());
};

export const chatWithCoach = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const startTime = Date.now();
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
      console.log(`[FORGE AI] Request started | User: ${userId} | Message: "${message.slice(0, 60)}..."`);
    }

    // 1. Retrieve scoped real user context from MongoDB via AiContextService
    const userContext = await AiContextService.getUserContext(userId, req.userName);

    // 2. Query recent conversation history
    let history: { role: string; content: string }[] = [];
    if (isMongoConnected) {
      let conversation: any = null;
      if (conversationId) {
        conversation = await AIConversation.findOne({ _id: conversationId, userId });
      } else {
        conversation = await AIConversation.findOne({ userId }).sort({ updatedAt: -1 });
      }

      if (conversation && Array.isArray(conversation.messages)) {
        history = conversation.messages.map((m: any) => ({ role: m.role, content: m.content }));
      }
    } else {
      const chat = memoryChats.get(`${userId}-${conversationId || 'default'}`) || [];
      history = chat.map((m: any) => ({ role: m.role, content: m.content }));
    }

    // 3. Assemble structured prompt via AiPromptService
    const { prompt, systemInstruction } = AiPromptService.buildFullPrompt({
      message: message.trim(),
      conversationHistory: history,
      userContext,
    });

    // 4. Execute Gemini SDK call via GeminiService
    const rawAiText = await GeminiService.getModelResponse(prompt, systemInstruction);

    // 5. Validate & sanitize output via AiResponseService
    const aiResponseText = AiResponseService.validateAndSanitize(rawAiText);

    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[FORGE AI] Request succeeded | Duration: ${duration}ms`);
    }

    // 6. Persist conversation
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
    const duration = Date.now() - startTime;
    const code = error?.code || 'GEMINI_ERROR';
    const status = error?.status || 500;
    const message = error?.message || 'FORGE AI could not complete this request. Please try again.';

    if (process.env.NODE_ENV === 'development') {
      console.error(`[FORGE AI ERROR] ${code} (HTTP ${status}) after ${duration}ms | Message: ${message}`);
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
