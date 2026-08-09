import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getJobApplications, createJobApplication, updateJobApplication, deleteJobApplication } from '../controllers/jobsController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getJobApplications);
router.post('/', createJobApplication);
router.put('/:id', updateJobApplication);
router.delete('/:id', deleteJobApplication);

export default router;
