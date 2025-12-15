import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';
import { ArticleService } from '../services/ArticleService';
import { ArticleRepository } from '../repositories/ArticleRepository';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { authenticate } from '../middlewares/auth';

const router = Router();
const articleRepo = new ArticleRepository();
const documentRepo = new DocumentRepository();
const projectRepo = new ProjectRepository();
const projectService = new ProjectService(projectRepo);
const articleService = new ArticleService(articleRepo, projectService, documentRepo);
const articleController = new ArticleController(articleService);

router.use(authenticate);

router.post('/projects/:projectId/articles', articleController.create);
router.get('/projects/:projectId/articles', articleController.list);
router.get('/projects/:projectId/bibliography', articleController.getBibliography);
router.get('/articles/:id', articleController.get);
router.put('/articles/:id', articleController.update);
router.delete('/articles/:id', articleController.delete);
router.post('/articles/:id/compile', articleController.compile);

export default router;
