// ═══════════════════════════════════════════════════════
// Backend/src/routes/chatbotRoutes.ts
// ═══════════════════════════════════════════════════════
import express from 'express';
import { chat, getChatHistory, clearHistory } from '../controllers/chatbotController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware'; 

const router = express.Router();

// ✅ ADDED: upload.single('image') to accept image attachments in the chat
router.post('/',           protect, upload.single('image'), chat);
router.get('/history',     protect, getChatHistory);
router.delete('/history',  protect, clearHistory);

export default router;