import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { QuestionModel } from '../models/Question.js';
import { QuestionHistory } from '../models/QuestionHistory.js';
import { CURATED_QUESTIONS, CuratedQuestion } from '../data/curatedQuestions.js';
import { GeminiService } from '../services/geminiService.js';
import { Activity } from '../models/Activity.js';
import { isMongoConnected } from '../config/db.js';

const memoryInterviews = new Map<string, any[]>();
const memoryHistory = new Map<string, any[]>();

export const getQuestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const technology = ((req.query.technology as string) || (req.query.category as string) || 'Java').trim();
    const category = (req.query.subCategory as string) || (req.query.topic as string) || '';
    const difficulty = ((req.query.difficulty as string) || 'Medium').trim();
    const allowRepetition = req.query.allowRepetition === 'true';
    const limit = parseInt((req.query.limit as string) || '5', 10);

    let candidates: CuratedQuestion[] = [];

    if (isMongoConnected) {
      const query: any = {};

      // Match technology (case insensitive regex)
      if (technology) {
        query.technology = { $regex: new RegExp(`^${technology}$`, 'i') };
      }

      if (category) {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }

      if (difficulty) {
        query.difficulty = { $regex: new RegExp(`^${difficulty}$`, 'i') };
      }

      let dbQuestions = await QuestionModel.find(query).lean();

      // If category filter returned nothing, fall back to matching just technology + difficulty
      if (dbQuestions.length === 0 && category) {
        delete query.category;
        dbQuestions = await QuestionModel.find(query).lean();
      }

      // If technology filter returned nothing in DB, check curated dataset fallback
      if (dbQuestions.length === 0) {
        candidates = CURATED_QUESTIONS.filter(
          (q) =>
            q.technology.toLowerCase() === technology.toLowerCase() &&
            (!difficulty || q.difficulty.toLowerCase() === difficulty.toLowerCase())
        );
      } else {
        candidates = dbQuestions as unknown as CuratedQuestion[];
      }
    } else {
      candidates = CURATED_QUESTIONS.filter((q) => {
        const techMatch = q.technology.toLowerCase() === technology.toLowerCase();
        const diffMatch = !difficulty || q.difficulty.toLowerCase() === difficulty.toLowerCase();
        const catMatch = !category || q.category.toLowerCase() === category.toLowerCase();
        return techMatch && diffMatch && (catMatch || true);
      });
    }

    if (candidates.length === 0) {
      // Fall back to any difficulty for that technology
      candidates = CURATED_QUESTIONS.filter(
        (q) => q.technology.toLowerCase() === technology.toLowerCase()
      );
    }

    // Step 5: Read user's interview history
    let answeredIds = new Set<string>();
    if (isMongoConnected) {
      const historyRecords = await QuestionHistory.find({ userId, technology: { $regex: new RegExp(`^${technology}$`, 'i') } }).select('questionId').lean();
      historyRecords.forEach((h) => answeredIds.add(h.questionId));
    } else {
      const userHist = memoryHistory.get(userId) || [];
      userHist.forEach((h) => {
        if (h.technology.toLowerCase() === technology.toLowerCase()) {
          answeredIds.add(h.questionId);
        }
      });
    }

    // Step 6 & 7: Exclude answered questions & prioritize unseen
    let unseenCandidates = candidates.filter((q) => !answeredIds.has(q.id));

    let poolExhausted = false;
    let selectedQuestions: CuratedQuestion[] = [];

    if (unseenCandidates.length > 0) {
      // Randomize ONLY unseen questions
      const shuffled = [...unseenCandidates].sort(() => 0.5 - Math.random());
      selectedQuestions = shuffled.slice(0, limit);
    } else if (allowRepetition && candidates.length > 0) {
      // Repeat mode enabled
      const shuffled = [...candidates].sort(() => 0.5 - Math.random());
      selectedQuestions = shuffled.slice(0, limit);
    } else {
      poolExhausted = true;
    }

    res.json({
      success: true,
      technology,
      category,
      difficulty,
      poolExhausted,
      message: poolExhausted ? "🎯 You've completed all curated questions for this selection." : undefined,
      totalAvailable: candidates.length,
      unseenCount: unseenCandidates.length,
      questions: selectedQuestions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching interview questions' });
  }
};

export const evaluateAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { questionId, questionText, technology, category, difficulty, userAnswer, mode } = req.body;

    if (!questionText || !userAnswer) {
      res.status(400).json({ success: false, message: 'Question text and user answer are required' });
      return;
    }

    const evaluation = await GeminiService.evaluateInterviewAnswer({
      question: questionText,
      category: category || technology || 'General Technical',
      userAnswer,
    });

    const finalTech = technology || category || 'General';
    const finalDiff = (difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium';

    // Record question history to prevent repetition
    const qId = questionId || `q-${Date.now()}`;
    if (isMongoConnected) {
      await QuestionHistory.create({
        userId,
        questionId: qId,
        technology: finalTech,
        category: category || 'General',
        difficulty: finalDiff,
        score: evaluation.score,
        userAnswer,
        feedback: evaluation.feedback,
        answeredAt: new Date(),
      });
    } else {
      const userHist = memoryHistory.get(userId) || [];
      userHist.push({
        userId,
        questionId: qId,
        technology: finalTech,
        category: category || 'General',
        difficulty: finalDiff,
        score: evaluation.score,
        userAnswer,
        feedback: evaluation.feedback,
        answeredAt: new Date(),
      });
      memoryHistory.set(userId, userHist);
    }

    const questionResult = {
      questionId: qId,
      questionText,
      technology: finalTech,
      category: category || finalTech,
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
        category: finalTech,
        difficulty: finalDiff,
        mode: mode || 'Practice',
        overallScore: evaluation.score,
        questions: [questionResult],
        summary: `Evaluated ${finalTech} (${finalDiff}) question. Score: ${evaluation.score}/100.`,
      });

      await Activity.create({
        userId,
        type: 'interview',
        title: `Practiced ${finalTech} Interview Question`,
        description: `Score: ${evaluation.score}/100 (${finalDiff})`,
      });
    } else {
      session = {
        _id: `int-${Date.now()}`,
        userId,
        category: finalTech,
        difficulty: finalDiff,
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

export const getInterviewAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    let totalSessions = 0;
    let questionsAnswered = 0;
    let avgScore = 0;
    let bestScore = 0;
    let techPerformance: Record<string, { total: number; avgScore: number; bestScore: number }> = {};

    if (isMongoConnected) {
      const historyRecords = await QuestionHistory.find({ userId }).lean();
      totalSessions = await InterviewSession.countDocuments({ userId });
      questionsAnswered = historyRecords.length;

      if (historyRecords.length > 0) {
        let totalScoreSum = 0;

        historyRecords.forEach((rec) => {
          totalScoreSum += rec.score;
          if (rec.score > bestScore) bestScore = rec.score;

          const tech = rec.technology || 'General';
          if (!techPerformance[tech]) {
            techPerformance[tech] = { total: 0, avgScore: 0, bestScore: 0 };
          }
          techPerformance[tech].total += 1;
          techPerformance[tech].avgScore += rec.score;
          if (rec.score > techPerformance[tech].bestScore) {
            techPerformance[tech].bestScore = rec.score;
          }
        });

        avgScore = Math.round(totalScoreSum / historyRecords.length);

        Object.keys(techPerformance).forEach((t) => {
          techPerformance[t].avgScore = Math.round(techPerformance[t].avgScore / techPerformance[t].total);
        });
      }
    } else {
      const userHist = memoryHistory.get(userId) || [];
      const userSess = memoryInterviews.get(userId) || [];
      totalSessions = userSess.length;
      questionsAnswered = userHist.length;

      if (userHist.length > 0) {
        let totalScoreSum = 0;
        userHist.forEach((rec) => {
          totalScoreSum += rec.score;
          if (rec.score > bestScore) bestScore = rec.score;

          const tech = rec.technology || 'General';
          if (!techPerformance[tech]) {
            techPerformance[tech] = { total: 0, avgScore: 0, bestScore: 0 };
          }
          techPerformance[tech].total += 1;
          techPerformance[tech].avgScore += rec.score;
          if (rec.score > techPerformance[tech].bestScore) {
            techPerformance[tech].bestScore = rec.score;
          }
        });

        avgScore = Math.round(totalScoreSum / userHist.length);
        Object.keys(techPerformance).forEach((t) => {
          techPerformance[t].avgScore = Math.round(techPerformance[t].avgScore / techPerformance[t].total);
        });
      }
    }

    res.json({
      success: true,
      analytics: {
        totalSessions,
        questionsAnswered,
        avgScore,
        bestScore,
        techPerformance,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching interview analytics' });
  }
};
