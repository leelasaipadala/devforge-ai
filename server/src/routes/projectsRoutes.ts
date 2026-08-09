import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getProjects, createProject, updateProject, deleteProject, getAIProjectIdeas } from '../controllers/projectsController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/ai-ideas', getAIProjectIdeas);

export default router;
