import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getCareerAnalytics } from '../controllers/analyticsController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getCareerAnalytics);

export default router;
