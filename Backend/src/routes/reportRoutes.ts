// ═══════════════════════════════════════════════════════
// Backend/src/routes/reportRoutes.ts
// ═══════════════════════════════════════════════════════
import express from 'express';
import { generateReport } from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
 
const router = express.Router();
 
router.get('/:detectionId', protect, generateReport);
 
export default router;