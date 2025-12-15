import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import mongoose from 'mongoose';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { ProjectService } from './ProjectService';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class DocumentService {
  constructor(
    private documentRepo: DocumentRepository,
    private projectService: ProjectService
  ) {}
  
  async upload(
    projectId: string,
    file: Express.Multer.File,
    userId: string,
    title?: string,
    bibtex?: string
  ) {
    await this.projectService.checkMembership(projectId, userId);
    
    logger.info({ 
      originalName: file.originalname, 
      mimetype: file.mimetype, 
      size: file.size,
      path: file.path,
      destination: file.destination,
      filename: file.filename
    }, 'Processing uploaded file');
    
    // Verify file exists after upload
    const fs = require('fs');
    const fileExists = fs.existsSync(file.path);
    logger.info({ filePath: file.path, exists: fileExists }, 'File existence check');
    
    if (!fileExists) {
      throw new Error('File was not saved to disk');
    }
    
    const textContent = await this.extractText(file);
    
    const document = await this.documentRepo.create({
      projectId: new mongoose.Types.ObjectId(projectId),
      title: title || file.originalname,
      type: path.extname(file.originalname).substring(1),
      originalFilename: file.originalname,
      textContent,
      uploadPath: file.path,
      metadata: { 
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      },
      bibtex: bibtex || '',
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    
    logger.info({ documentId: document._id, uploadPath: file.path }, 'Document created successfully');
    
    return document;
  }
  
  async list(projectId: string, userId: string) {
    await this.projectService.checkMembership(projectId, userId);
    return await this.documentRepo.findByProjectId(projectId);
  }
  
  async get(id: string, userId: string) {
    const document = await this.documentRepo.findById(id);
    if (!document) {
      throw new NotFoundError('Document not found');
    }
    
    await this.projectService.checkMembership(document.projectId.toString(), userId);
    return document;
  }
  
  async delete(id: string, userId: string) {
    const document = await this.get(id, userId);
    
    try {
      await fs.unlink(document.uploadPath);
    } catch (error) {
      // File may not exist, continue
    }
    
    await this.documentRepo.delete(id);
  }
  
  private async extractText(file: Express.Multer.File): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    
    logger.info({ filename: file.originalname, ext, size: file.size }, 'Extracting text from file');
    
    if (ext === '.txt') {
      return await fs.readFile(file.path, 'utf-8');
    }
    
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: file.path });
      logger.info({ textLength: result.value.length }, 'Text extracted from DOCX');
      return result.value;
    }
    
    if (ext === '.pdf') {
      try {
        const dataBuffer = await fs.readFile(file.path);
        logger.info({ bufferSize: dataBuffer.length }, 'PDF buffer read');
        
        const data = await pdf(dataBuffer);
        logger.info({ 
          numPages: data.numpages, 
          textLength: data.text.length,
          info: data.info 
        }, 'PDF text extracted');
        
        return data.text;
      } catch (error: any) {
        logger.error({ error: error.message, stack: error.stack }, 'Error extracting PDF text');
        return '[PDF text extraction failed - file uploaded for manual review]';
      }
    }
    
    throw new Error('Unsupported file type');
  }
}
