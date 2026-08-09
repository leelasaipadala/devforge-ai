import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getQuestions, evaluateAnswer, getInterviewSessions } from '../controllers/interviewController.js';

const router = Router();

router.use(requireAuth);
router.get('/questions', getQuestions);
router.post('/evaluate', evaluateAnswer);
router.get('/sessions', getInterviewSessions);

export default router;
