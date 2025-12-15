import { Router } from 'express';
import { MemoController } from '../controllers/MemoController';
import { MemoService } from '../services/MemoService';
import { MemoRepository } from '../repositories/MemoRepository';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { createMemoSchema, updateMemoSchema } from '../validators/memo';

const router = Router();
const memoRepo = new MemoRepository();
const projectRepo = new ProjectRepository();
const projectService = new ProjectService(projectRepo);
const memoService = new MemoService(memoRepo, projectService);
const memoController = new MemoController(memoService);

router.use(authenticate);

router.post('/projects/:projectId/memos', validate(createMemoSchema), memoController.create);
router.get('/projects/:projectId/memos', memoController.list);
router.put('/memos/:id', validate(updateMemoSchema), memoController.update);
router.delete('/memos/:id', memoController.delete);

export default router;
