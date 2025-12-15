import { Response, NextFunction } from 'express';
import { ProjectService } from '../services/ProjectService';
import { AuthRequest } from '../middlewares/auth';
import { logger } from '../utils/logger';

export class ProjectController {
  constructor(private projectService: ProjectService) {}
  
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, description, memberIds } = req.body;
      const project = await this.projectService.create(name, description, req.user!.userId, memberIds);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  };
  
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectService.list(req.user!.userId);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  };
  
  get = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      logger.debug({ projectId: id, userId: req.user!.userId }, 'Getting project');
      
      const project = await this.projectService.get(id, req.user!.userId);
      res.json(project);
    } catch (error) {
      next(error);
    }
  };
  
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectService.update(req.params.id, req.user!.userId, req.body);
      res.json(project);
    } catch (error) {
      next(error);
    }
  };
  
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.projectService.delete(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
