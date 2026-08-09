import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getRoadmap, generateRoadmap, toggleRoadmapItem } from '../controllers/roadmapController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getRoadmap);
router.post('/generate', generateRoadmap);
router.post('/item/toggle', toggleRoadmapItem);

export default router;
