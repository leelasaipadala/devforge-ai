import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { chatWithCoach, getConversationHistory, clearConversation } from '../controllers/aiController.js';

const router = Router();

router.use(requireAuth);
router.post('/chat', chatWithCoach);
router.get('/history', getConversationHistory);
router.delete('/history', clearConversation);

export default router;
