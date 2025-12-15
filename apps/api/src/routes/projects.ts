import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { createProjectSchema, updateProjectSchema } from '../validators/project';

const router = Router();
const projectRepo = new ProjectRepository();
const projectService = new ProjectService(projectRepo);
const projectController = new ProjectController(projectService);

router.use(authenticate);

// IMPORTANTE: Rotas específicas ANTES das rotas com parâmetros
router.post('/', validate(createProjectSchema), projectController.create);
router.get('/', projectController.list);

// Rotas com parâmetros vêm DEPOIS
router.get('/:id', projectController.get);
router.put('/:id', validate(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.delete);

export default router;
