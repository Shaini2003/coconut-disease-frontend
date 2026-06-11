// Backend/src/middleware/uploadMiddleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Uploads ෆෝල්ඩරය නැතිනම් එය ස්වයංක්‍රීයව සෑදීම
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// පින්තූර Save කරන තැන සහ නම සැකසීම
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

// පින්තූර පමණක් (Images only) භාරගැනීම
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

// උපරිම 10MB සීමාව
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter 
});

export default upload;