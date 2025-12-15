import { Response, NextFunction } from 'express';
import { MemoService } from '../services/MemoService';
import { AuthRequest } from '../middlewares/auth';

export class MemoController {
  constructor(private memoService: MemoService) {}
  
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const memo = await this.memoService.create(projectId, req.user!.userId, req.body);
      res.status(201).json(memo);
    } catch (error) {
      next(error);
    }
  };
  
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const memos = await this.memoService.list(projectId, req.user!.userId);
      res.json(memos);
    } catch (error) {
      next(error);
    }
  };
  
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const memo = await this.memoService.update(req.params.id, req.user!.userId, req.body);
      res.json(memo);
    } catch (error) {
      next(error);
    }
  };
  
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.memoService.delete(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
