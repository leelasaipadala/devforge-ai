import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { analyzeGitHubProfile, getGitHubProfile, importToProjects } from '../controllers/githubController.js';

const router = Router();

router.use(requireAuth);
router.get('/profile', getGitHubProfile);
router.get('/analyze', analyzeGitHubProfile);
router.post('/analyze', analyzeGitHubProfile);
router.post('/import-to-projects', importToProjects);

export default router;

