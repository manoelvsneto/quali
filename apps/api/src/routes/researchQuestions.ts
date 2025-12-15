import { Router } from 'express';
import { ResearchQuestionController } from '../controllers/ResearchQuestionController';
import { ResearchQuestionService } from '../services/ResearchQuestionService';
import { ResearchQuestionRepository } from '../repositories/ResearchQuestionRepository';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { authenticate } from '../middlewares/auth';

const router = Router();
const rqRepo = new ResearchQuestionRepository();
const projectRepo = new ProjectRepository();
const projectService = new ProjectService(projectRepo);
const rqService = new ResearchQuestionService(rqRepo, projectService);
const rqController = new ResearchQuestionController(rqService);

router.use(authenticate);

router.post('/projects/:projectId/research-questions', rqController.create);
router.get('/projects/:projectId/research-questions', rqController.list);
router.get('/research-questions/:id', rqController.get);
router.put('/research-questions/:id', rqController.update);
router.delete('/research-questions/:id', rqController.delete);

export default router;
