import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { chatWithCoach, getConversationHistory, clearConversation, getAiHealth } from '../controllers/aiController.js';

const router = Router();

// Health check endpoint (Public)
router.get('/health', getAiHealth);

// Authenticated routes
router.use(requireAuth);
router.post('/chat', chatWithCoach);
router.get('/history', getConversationHistory);
router.delete('/history', clearConversation);

export default router;
