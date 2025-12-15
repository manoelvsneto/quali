import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const uploadsDir = path.join(process.cwd(), 'uploads');

logger.info({ uploadsDir }, 'Checking uploads directory');

if (!fs.existsSync(uploadsDir)) {
  logger.error('Uploads directory does not exist!');
  process.exit(1);
}

const files = fs.readdirSync(uploadsDir);
logger.info({ count: files.length, files }, 'Files in uploads directory');

files.forEach(file => {
  const filePath = path.join(uploadsDir, file);
  const stats = fs.statSync(filePath);
  logger.info({
    file,
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  }, 'File info');
});
