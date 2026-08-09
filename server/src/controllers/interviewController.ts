import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { GeminiService } from '../services/geminiService.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

const memoryInterviews = new Map<string, any[]>();

const QUESTION_BANK: Record<string, { id: string; question: string; category: string; difficulty: 'Easy' | 'Medium' | 'Hard'; expectedKeyPoints: string[] }[]> = {
  Backend: [
    {
      id: 'q-be-1',
      question: 'Explain how Node.js event loop handles non-blocking I/O operations and asynchronous callbacks.',
      category: 'Backend',
      difficulty: 'Medium',
      expectedKeyPoints: ['V8 Engine', 'libuv thread pool', 'Phases: Poll, Check, Timers', 'Microtask Queue vs Macrotask Queue'],
    },
    {
      id: 'q-be-2',
      question: 'What is the difference between SQL indexing (B-Trees) and NoSQL document query patterns? How do you prevent full-table scans?',
      category: 'Backend',
      difficulty: 'Medium',
      expectedKeyPoints: ['B-Tree index structure', 'Covering indexes', 'Explain query plan', 'Compound indexing strategy'],
    },
  ],
  Frontend: [
    {
      id: 'q-fe-1',
      question: 'Explain the Virtual DOM reconciliation algorithm in React 18+ and how Fibre architecture schedules priorities.',
      category: 'Frontend',
      difficulty: 'Hard',
      expectedKeyPoints: ['Diffing algorithm O(n)', 'Fiber tree nodes', 'Concurrent rendering', 'useTransition & useDeferredValue'],
    },
    {
      id: 'q-fe-2',
      question: 'How do you optimize Web Vitals (LCP, CLS, INP) in modern Next.js applications?',
      category: 'Frontend',
      difficulty: 'Medium',
      expectedKeyPoints: ['Image optimization', 'Font display swap', 'Code splitting', 'Server-side rendering vs Streaming'],
    },
  ],
  DSA: [
    {
      id: 'q-dsa-1',
      question: 'Given an array of integers, find the contiguous subarray with the largest sum (Kadane’s Algorithm). State time and space complexity.',
      category: 'DSA',
      difficulty: 'Easy',
      expectedKeyPoints: ['Dynamic programming idea', 'O(N) time complexity', 'O(1) space complexity', 'Current max vs global max'],
    },
    {
      id: 'q-dsa-2',
      question: 'How do you detect a cycle in a Directed Graph using Depth-First Search (DFS) or Kahn’s Algorithm?',
      category: 'DSA',
      difficulty: 'Medium',
      expectedKeyPoints: ['Visited state array (0=Unvisited, 1=Visiting, 2=Visited)', 'In-degree array for Topological Sort', 'Back-edge detection'],
    },
  ],
  SystemDesign: [
    {
      id: 'q-sd-1',
      question: 'Design a scalable URL shortening service (like Bitly). How do you handle 100M daily active requests and key generation collisions?',
      category: 'System Design',
      difficulty: 'Hard',
      expectedKeyPoints: ['Base62 encoding', 'Key Generation Service (KGS)', 'Redis caching layer', 'Database sharding by hash'],
    },
  ],
};

export const getQuestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = (req.query.category as string) || 'Backend';
    const difficulty = (req.query.difficulty as string) || 'Medium';

    const questionsList = QUESTION_BANK[category] || QUESTION_BANK['Backend'];
    const filtered = questionsList.filter((q) => !difficulty || q.difficulty === difficulty);

    res.json({ success: true, questions: filtered.length > 0 ? filtered : questionsList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching interview questions' });
  }
};

export const evaluateAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { questionText, category, difficulty, userAnswer, mode } = req.body;

    if (!questionText || !userAnswer) {
      res.status(400).json({ success: false, message: 'Question text and user answer are required' });
      return;
    }

    const evaluation = await GeminiService.evaluateInterviewAnswer({
      question: questionText,
      category: category || 'General Technical',
      userAnswer,
    });

    const questionResult = {
      questionText,
      category: category || 'Backend',
      userAnswer,
      feedback: evaluation.feedback,
      score: evaluation.score,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    };

    let session: any = null;

    if (isMongoConnected) {
      session = await InterviewSession.create({
        userId,
        category: category || 'Backend',
        difficulty: difficulty || 'Medium',
        mode: mode || 'Practice',
        overallScore: evaluation.score,
        questions: [questionResult],
        summary: `Evaluated technical interview question in ${category}. Score: ${evaluation.score}/100.`,
      });

      await Activity.create({
        userId,
        type: 'interview',
        title: `Practiced ${category} Interview Question`,
        description: `Score: ${evaluation.score}/100`,
      });
    } else {
      session = {
        _id: `int-${Date.now()}`,
        userId,
        category: category || 'Backend',
        difficulty: difficulty || 'Medium',
        mode: mode || 'Practice',
        overallScore: evaluation.score,
        questions: [questionResult],
        createdAt: new Date(),
      };
      const existing = memoryInterviews.get(userId) || [];
      existing.unshift(session);
      memoryInterviews.set(userId, existing);
    }

    res.json({
      success: true,
      evaluation,
      session,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error evaluating interview answer' });
  }
};

export const getInterviewSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    let sessions: any[] = [];

    if (isMongoConnected) {
      sessions = await InterviewSession.find({ userId }).sort({ createdAt: -1 });
    } else {
      sessions = memoryInterviews.get(userId) || [];
    }

    res.json({ success: true, sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching interview sessions' });
  }
};
