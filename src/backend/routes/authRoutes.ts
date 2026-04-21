import { Router } from 'express';
import { login, changePin, generateTOTP, verifyAndEnableTOTP, disableTOTP } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/change-pin', authMiddleware, changePin);
router.post('/generate-2fa', authMiddleware, generateTOTP);
router.post('/verify-enable-2fa', authMiddleware, verifyAndEnableTOTP);
router.post('/disable-2fa', authMiddleware, disableTOTP);

export default router;
