import { Response, NextFunction } from 'express';
import { CodeService } from '../services/CodeService';
import { AuthRequest } from '../middlewares/auth';

export class CodeController {
  constructor(private codeService: CodeService) {}
  
  createCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const code = await this.codeService.createCode(projectId, req.user!.userId, req.body);
      res.status(201).json(code);
    } catch (error) {
      next(error);
    }
  };
  
  createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const { name, parentId } = req.body;
      const category = await this.codeService.createCategory(projectId, req.user!.userId, name, parentId);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  };
  
  listCodes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const codes = await this.codeService.listCodes(projectId, req.user!.userId);
      res.json(codes);
    } catch (error) {
      next(error);
    }
  };
  
  listCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const categories = await this.codeService.listCategories(projectId, req.user!.userId);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };
  
  updateCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const code = await this.codeService.updateCode(req.params.id, req.user!.userId, req.body);
      res.json(code);
    } catch (error) {
      next(error);
    }
  };
  
  deleteCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.codeService.deleteCode(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
