import { Router } from 'express';
import { testController } from '../controllers/test';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateTestSubmission } from '../middleware/validation.middleware';

const router = Router();

router.post('/submit', authMiddleware, validateTestSubmission, testController.submitTest);
router.get('/history', authMiddleware, testController.getTestHistory);
router.get('/history/:id', authMiddleware, testController.getTestDetails);

export const testRouter = router;