import { Router } from 'express';
import { flashcardController } from '../controllers/flashcard';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../utils/upload';
import { validateFlashcard } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
  ]),
  validateFlashcard,
  flashcardController.createFlashcard
);

router.get('/', authMiddleware, flashcardController.getUserFlashcards);

router.put(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
  ]),
  validateFlashcard,
  flashcardController.updateFlashcard
);

router.delete('/:id', authMiddleware, flashcardController.deleteFlashcard);

export const flashcardRouter = router;