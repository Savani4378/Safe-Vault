import { Router } from 'express';
import { login, changePin } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/change-pin', authMiddleware, changePin);

export default router;
