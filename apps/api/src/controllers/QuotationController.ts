import { Response, NextFunction } from 'express';
import { QuotationService } from '../services/QuotationService';
import { AuthRequest } from '../middlewares/auth';

export class QuotationController {
  constructor(private quotationService: QuotationService) {}
  
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const quotation = await this.quotationService.create(req.user!.userId, req.body);
      res.status(201).json(quotation);
    } catch (error) {
      next(error);
    }
  };
  
  listByDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;
      const quotations = await this.quotationService.listByDocument(documentId, req.user!.userId);
      res.json(quotations);
    } catch (error) {
      next(error);
    }
  };
  
  query = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const quotations = await this.quotationService.query(projectId, req.user!.userId, req.query);
      res.json(quotations);
    } catch (error) {
      next(error);
    }
  };
  
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const quotation = await this.quotationService.update(id, req.user!.userId, req.body.codeIds);
      res.json(quotation);
    } catch (error) {
      next(error);
    }
  };
  
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.quotationService.delete(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
