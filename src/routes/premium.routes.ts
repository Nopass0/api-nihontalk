import { Router } from 'express';
import { premiumController } from '../controllers/premium';
import { authMiddleware } from '../middleware/auth.middleware';
import { validatePremiumPurchase } from '../middleware/validation.middleware';

const router = Router();

router.post('/purchase', authMiddleware, validatePremiumPurchase, premiumController.purchasePremium);
router.get('/status', authMiddleware, premiumController.getPremiumStatus);
router.get('/history', authMiddleware, premiumController.getPremiumHistory);

export const premiumRouter = router;