import multer from 'multer';
import path from 'path';
import { env } from '../config/env';
import fs from 'fs';
import { logger } from '../utils/logger';

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), env.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info({ uploadDir }, 'Upload directory created');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.info({ uploadDir, file: file.originalname }, 'Setting upload destination');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    logger.info({ originalName: file.originalname, savedAs: filename, fullPath: path.join(uploadDir, filename) }, 'Saving file');
    cb(null, filename);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    logger.info({ 
      originalName: file.originalname, 
      mimetype: file.mimetype, 
      ext 
    }, 'File filter check');
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type ${ext}. Only .txt, .docx, and .pdf allowed`));
    }
  },
});
