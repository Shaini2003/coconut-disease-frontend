// ═══════════════════════════════════════════════════════
// Backend/src/routes/chatbotRoutes.ts
// ═══════════════════════════════════════════════════════
import express from 'express';
import { chat, getChatHistory, clearHistory } from '../controllers/chatbotController';
import { protect } from '../middleware/authMiddleware';
 
const router = express.Router();
 
router.post('/',           protect, chat);
router.get('/history',     protect, getChatHistory);
router.delete('/history',  protect, clearHistory);
 
export default router;