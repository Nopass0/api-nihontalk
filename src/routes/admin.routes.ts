import { Router } from 'express';
import { adminController } from '../controllers/admin';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateCourse } from '../middleware/validation.middleware';
import { upload } from '../utils/upload';

const router = Router();

router.post('/courses', authMiddleware, validateCourse, adminController.createCourse);
router.put('/courses/:id', authMiddleware, validateCourse, adminController.updateCourse);
router.delete('/courses/:id', authMiddleware, adminController.deleteCourse);

export const adminRouter = router;