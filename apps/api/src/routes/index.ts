import { Router } from 'express';
import authRoutes from './auth';
import projectRoutes from './projects';
import documentRoutes from './documents';
import quotationRoutes from './quotations';
import memoRoutes from './memos';
import articleRoutes from './articles';

const router = Router();

// Rotas de autenticação (sem middleware authenticate global)
router.use('/auth', authRoutes);

// Outras rotas (já tem authenticate dentro de cada rota específica)
router.use('/projects', projectRoutes);
router.use('/', documentRoutes);
router.use('/', quotationRoutes);
router.use('/', memoRoutes);
router.use('/', articleRoutes);

export default router;
