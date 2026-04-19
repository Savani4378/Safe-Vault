import { Router } from 'express';
import multer from 'multer';
import { createVault, unlockVault, listVaults, removeVault, getLogs } from '../controllers/vaultController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/create', authMiddleware, upload.array('files'), createVault);
router.post('/unlock', authMiddleware, unlockVault);
router.get('/list', authMiddleware, listVaults);
router.get('/logs', authMiddleware, getLogs);
router.delete('/remove/:id', authMiddleware, removeVault);

export default router;
