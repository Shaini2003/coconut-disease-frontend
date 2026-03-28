// ═══════════════════════════════════════════════════════
// Backend/src/routes/authRoutes.ts
// ═══════════════════════════════════════════════════════
import express from 'express';
import { signup, login, getProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
 
const router = express.Router();
 
router.post('/signup',  signup);
router.post('/login',   login);
router.get('/profile',  protect, getProfile);
 
export default router;