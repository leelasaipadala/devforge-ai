import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, completeOnboarding } from '../controllers/profileController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/onboarding', completeOnboarding);

export default router;
