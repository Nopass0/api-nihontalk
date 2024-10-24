import { Router } from 'express';
import { courseController } from '../controllers/course';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateCourseEnrollment, validateProgressUpdate } from '../middleware/validation.middleware';

const router = Router();

router.post('/enroll', authMiddleware, validateCourseEnrollment, courseController.enrollCourse);
router.put('/progress', authMiddleware, validateProgressUpdate, courseController.updateProgress);
router.get('/search', courseController.searchCourses);
router.get('/user', authMiddleware, courseController.getUserCourses);

export const courseRouter = router;