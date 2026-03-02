import express from 'express';
import multer from 'multer';
import path from 'path';
import { detectDisease, getHistory, getDiseaseInfo } from '../controllers/detectionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Make uploads folder if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

router.post('/', protect, upload.single('image'), detectDisease);
router.get('/history', protect, getHistory);
router.get('/diseases', getDiseaseInfo);

export default router;