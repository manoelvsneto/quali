import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodbUri);
    logger.info('MongoDB connected successfully');
    
    // Create indexes
    await createIndexes();
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    
    // Users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Projects
    await db.collection('projects').createIndex({ memberIds: 1 });
    
    // Documents
    await db.collection('documents').createIndex({ projectId: 1 });
    await db.collection('documents').createIndex({ textContent: 'text' });
    
    // Codes
    await db.collection('codes').createIndex({ projectId: 1 });
    await db.collection('codes').createIndex({ categoryId: 1 });
    
    // Quotations
    await db.collection('quotations').createIndex({ projectId: 1 });
    await db.collection('quotations').createIndex({ documentId: 1 });
    await db.collection('quotations').createIndex({ codeIds: 1 });
    
    // Memos
    await db.collection('memos').createIndex({ projectId: 1 });
    await db.collection('memos').createIndex({ documentId: 1 });
    
    logger.info('Database indexes created');
  } catch (error) {
    logger.error('Error creating indexes:', error);
  }
};
