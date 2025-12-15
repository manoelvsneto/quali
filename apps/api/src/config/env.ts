import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  
  // Database selection
  dbType:'mongodb', 
  
  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/quali?authSource=admin',
  
  
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
};
