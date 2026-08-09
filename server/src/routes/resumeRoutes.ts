import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/authMiddleware.js';
import { analyzeResume, getResumeHistory } from '../controllers/resumeController.js';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = Router();

router.use(requireAuth);
router.post('/analyze', upload.single('resume'), analyzeResume);
router.get('/history', getResumeHistory);

export default router;
