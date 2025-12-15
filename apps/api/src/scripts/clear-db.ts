import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { DocumentModel } from '../models/Document';
import { Code } from '../models/Code';
import { Category } from '../models/Category';
import { Quotation } from '../models/Quotation';
import { Memo } from '../models/Memo';
import { logger } from '../utils/logger';

const clearDatabase = async () => {
  try {
    await connectDatabase();
    
    logger.info('Clearing database...');
    
    await Memo.deleteMany({});
    await Quotation.deleteMany({});
    await Code.deleteMany({});
    await Category.deleteMany({});
    await DocumentModel.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    
    logger.info('Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to clear database:', error);
    process.exit(1);
  }
};

clearDatabase();
