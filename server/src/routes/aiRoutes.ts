import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { chatWithCoach, getConversationHistory, clearConversation, getAiStatus } from '../controllers/aiController.js';

const router = Router();

// Public Status & Health Check Endpoints
router.get('/status', getAiStatus);
router.get('/health', getAiStatus);

// Authenticated Routes
router.use(requireAuth);
router.post('/chat', chatWithCoach);
router.get('/history', getConversationHistory);
router.delete('/history', clearConversation);

export default router;
