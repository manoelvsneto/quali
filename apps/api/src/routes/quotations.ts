import { Router } from 'express';
import { QuotationController } from '../controllers/QuotationController';
import { QuotationService } from '../services/QuotationService';
import { QuotationRepository } from '../repositories/QuotationRepository';
import { DocumentService } from '../services/DocumentService';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { createQuotationSchema, updateQuotationSchema } from '../validators/quotation';

const router = Router();
const quotationRepo = new QuotationRepository();
const documentRepo = new DocumentRepository();
const projectRepo = new ProjectRepository();
const projectService = new ProjectService(projectRepo);
const documentService = new DocumentService(documentRepo, projectService);
const quotationService = new QuotationService(quotationRepo, documentService);
const quotationController = new QuotationController(quotationService);

router.use(authenticate);

router.post('/quotations', validate(createQuotationSchema), quotationController.create);
router.get('/documents/:documentId/quotations', quotationController.listByDocument);
router.get('/projects/:projectId/query', quotationController.query);
router.put('/quotations/:id', validate(updateQuotationSchema), quotationController.update);
router.delete('/quotations/:id', quotationController.delete);

export default router;
