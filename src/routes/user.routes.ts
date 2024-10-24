import { Router } from 'express';
import { userController } from '../controllers/user';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../utils/upload';
import { validateRegistration, validateLogin, validatePasswordChange } from '../middleware/validation.middleware';

const router = Router();

router.post('/register', upload.single('avatar'), validateRegistration, userController.register);
router.post('/login', validateLogin, userController.login);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), userController.updateProfile);
router.put('/password', authMiddleware, validatePasswordChange, userController.changePassword);
router.get('/search', userController.searchUsers);

export const userRouter = router;