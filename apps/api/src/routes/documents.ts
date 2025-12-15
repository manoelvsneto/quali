import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { DocumentService } from '../services/DocumentService';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();
const documentRepo = new DocumentRepository();
const projectRepo = new ProjectRepository();
const projectService = new ProjectService(projectRepo);
const documentService = new DocumentService(documentRepo, projectService);
const documentController = new DocumentController(documentService);

// REMOVA esta linha em produção:
// router.get('/documents/:id/file-test', documentController.getFileTest);

// Rotas protegidas
router.use(authenticate);

router.post('/projects/:projectId/documents', upload.single('file'), documentController.upload);
router.get('/projects/:projectId/documents', documentController.list);
router.get('/documents/:id', documentController.get);
router.get('/documents/:id/file', documentController.getFile);
router.delete('/documents/:id', documentController.delete);

export default router;
