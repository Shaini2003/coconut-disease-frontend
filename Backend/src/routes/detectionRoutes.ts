// ═══════════════════════════════════════════════════════
// Backend/src/routes/detectionRoutes.ts
// ═══════════════════════════════════════════════════════
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { detectDisease, getHistory, getDiseaseInfo } from '../controllers/detectionController';
import { protect } from '../middleware/authMiddleware';
 
const router = express.Router();
 
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
 
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Only image files allowed (jpg, png, webp)'));
  },
});
 
router.post('/',         protect, upload.single('image'), detectDisease);
router.get('/history',   protect, getHistory);
router.get('/diseases',  getDiseaseInfo);
 
export default router;