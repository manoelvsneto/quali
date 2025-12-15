import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { DocumentModel } from '../models/Document';
import { Code } from '../models/Code';
import { Category } from '../models/Category';
import { Quotation } from '../models/Quotation';
import { Memo } from '../models/Memo';
import { logger } from '../utils/logger';

const seed = async () => {
  try {
    await connectDatabase();
    
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await DocumentModel.deleteMany({});
    await Code.deleteMany({});
    await Category.deleteMany({});
    await Quotation.deleteMany({});
    await Memo.deleteMany({});
    
    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 10);
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@quali.com',
      passwordHash,
      roles: ['user'],
    });
    
    logger.info('Created demo user: demo@quali.com / demo123');
    
    // Create demo project
    const project = await Project.create({
      name: 'Research Project Demo',
      description: 'Qualitative analysis of interview transcripts',
      memberIds: [user._id],
      createdBy: user._id,
    });
    
    logger.info('Created demo project');
    
    // Create demo categories
    const themesCategory = await Category.create({
      projectId: project._id,
      name: 'Themes',
      createdBy: user._id,
    });
    
    const emotionsCategory = await Category.create({
      projectId: project._id,
      name: 'Emotions',
      createdBy: user._id,
    });
    
    // Create demo codes
    await Code.create([
      {
        projectId: project._id,
        name: 'Motivation',
        color: '#3B82F6',
        description: 'Factors that motivate participants',
        categoryId: themesCategory._id,
        createdBy: user._id,
      },
      {
        projectId: project._id,
        name: 'Barriers',
        color: '#EF4444',
        description: 'Obstacles and challenges',
        categoryId: themesCategory._id,
        createdBy: user._id,
      },
      {
        projectId: project._id,
        name: 'Positive',
        color: '#10B981',
        description: 'Positive emotional expressions',
        categoryId: emotionsCategory._id,
        createdBy: user._id,
      },
      {
        projectId: project._id,
        name: 'Negative',
        color: '#F59E0B',
        description: 'Negative emotional expressions',
        categoryId: emotionsCategory._id,
        createdBy: user._id,
      },
    ]);
    
    logger.info('Created demo codes and categories');
    
    // Create demo document
    const demoText = `Interview Transcript - Participant 001

Q: What motivated you to participate in this study?
A: I was really interested in contributing to research. I feel like there's not enough focus on this topic, and I wanted to share my experiences. It felt meaningful.

Q: What challenges did you face?
A: Time was a big issue. Balancing work and personal life made it difficult to commit fully. Also, some of the questions were emotionally draining.

Q: How did you feel during the process?
A: Initially excited and hopeful. But as we went deeper, I felt some anxiety and stress. Overall, it was a positive experience though.`;
    
    await DocumentModel.create({
      projectId: project._id,
      title: 'Interview Transcript 001',
      type: 'txt',
      originalFilename: 'transcript_001.txt',
      textContent: demoText,
      uploadPath: '/demo/transcript_001.txt',
      metadata: { participant: '001' },
      createdBy: user._id,
    });
    
    logger.info('Created demo document');
    logger.info('Seed completed successfully!');
    
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
