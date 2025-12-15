import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

import { DocumentService } from '../services/DocumentService';
import { AuthRequest } from '../middlewares/auth';
import { logger } from '../utils/logger';

export class DocumentController {
  constructor(private documentService: DocumentService) {}
  
  upload = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const file = req.file!;
      const { title, bibtex } = req.body;
      
      const document = await this.documentService.upload(
        projectId, 
        file, 
        req.user!.userId, 
        title,
        bibtex
      );
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  };
  
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const documents = await this.documentService.list(projectId, req.user!.userId);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  };
  
  get = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const document = await this.documentService.get(req.params.id, req.user!.userId);
      res.json(document);
    } catch (error) {
      next(error);
    }
  };
  
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.documentService.delete(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
  
  getFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const document = await this.documentService.get(req.params.id, req.user!.userId);
      
      const filePath = path.resolve(document.uploadPath);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        logger.error({ filePath, documentId: document._id }, 'File not found on disk');
        return res.status(404).json({ error: 'File not found on disk' });
      }
      
      const ext = path.extname(document.originalFilename).toLowerCase();
      const stats = fs.statSync(filePath);
      
      logger.info({ 
        documentId: document._id, 
        filePath, 
        originalName: document.originalFilename,
        ext,
        fileSize: stats.size,
        exists: true
      }, 'Serving file');
      
      // Set appropriate content type
      const contentType = ext === '.pdf' ? 'application/pdf' : 
                         ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                         'text/plain';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size.toString());
      res.setHeader('Content-Disposition', `inline; filename="${document.originalFilename}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        logger.error({ error, filePath }, 'Error streaming file');
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading file' });
        }
      });
      
      fileStream.pipe(res);
      
    } catch (error) {
      next(error);
    }
  };
  
  // Método de teste SEM autenticação (REMOVER EM PRODUÇÃO)
  getFileTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // Buscar documento diretamente do repositório sem validar usuário
      const document = await this.documentService['documentRepo'].findById(id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      const filePath = path.resolve(document.uploadPath);
      
      if (!fs.existsSync(filePath)) {
        logger.error({ filePath, documentId: document._id }, 'File not found on disk');
        return res.status(404).json({ error: 'File not found on disk' });
      }
      
      const ext = path.extname(document.originalFilename).toLowerCase();
      const stats = fs.statSync(filePath);
      
      logger.info({ 
        documentId: document._id, 
        filePath, 
        originalName: document.originalFilename,
        ext,
        fileSize: stats.size,
        exists: true
      }, 'Serving file (TEST MODE)');
      
      const contentType = ext === '.pdf' ? 'application/pdf' : 
                         ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                         'text/plain';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size.toString());
      res.setHeader('Content-Disposition', `inline; filename="${document.originalFilename}"`);
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.setHeader('Accept-Ranges', 'bytes');
      
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        logger.error({ error, filePath }, 'Error streaming file');
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading file' });
        }
      });
      
      fileStream.pipe(res);
      
    } catch (error) {
      next(error);
    }
  };
}
