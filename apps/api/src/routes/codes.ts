import { Router } from 'express';
import { CodeController } from '../controllers/CodeController';
import { CodeService } from '../services/CodeService';
import { CodeRepository } from '../repositories/CodeRepository';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { createCodeSchema, updateCodeSchema } from '../validators/code';

const router = Router();
const codeRepo = new CodeRepository();
const projectRepo = new ProjectRepository();
const projectService = new ProjectService(projectRepo);
const codeService = new CodeService(codeRepo, projectService);
const codeController = new CodeController(codeService);

router.use(authenticate);

router.post('/projects/:projectId/codes', validate(createCodeSchema), codeController.createCode);
router.get('/projects/:projectId/codes', codeController.listCodes);
router.post('/projects/:projectId/categories', codeController.createCategory);
router.get('/projects/:projectId/categories', codeController.listCategories);
router.put('/codes/:id', validate(updateCodeSchema), codeController.updateCode);
router.delete('/codes/:id', codeController.deleteCode);

export default router;
