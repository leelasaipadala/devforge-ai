import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getSkills, addSkill, updateSkill, deleteSkill, getSkillGapAnalysis } from '../controllers/skillsController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getSkills);
router.post('/', addSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);
router.get('/gap-analysis', getSkillGapAnalysis);

export default router;
