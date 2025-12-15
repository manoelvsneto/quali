import { Response, NextFunction } from 'express';
import { ResearchQuestionService } from '../services/ResearchQuestionService';
import { AuthRequest } from '../middlewares/auth';

export class ResearchQuestionController {
  constructor(private rqService: ResearchQuestionService) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const rq = await this.rqService.create(projectId, req.user!.userId, req.body);
      res.status(201).json(rq);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const rqs = await this.rqService.list(projectId, req.user!.userId);
      res.json(rqs);
    } catch (error) {
      next(error);
    }
  };

  get = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rq = await this.rqService.get(req.params.id, req.user!.userId);
      res.json(rq);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const rq = await this.rqService.update(req.params.id, req.user!.userId, req.body);
      res.json(rq);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.rqService.delete(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
