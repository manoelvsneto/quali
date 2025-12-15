import { Response, NextFunction } from 'express';
import { ArticleService } from '../services/ArticleService';
import { AuthRequest } from '../middlewares/auth';

export class ArticleController {
  constructor(private articleService: ArticleService) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const { title } = req.body;
      const article = await this.articleService.create(projectId, req.user!.userId, title);
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const articles = await this.articleService.listByProject(projectId, req.user!.userId);
      res.json(articles);
    } catch (error) {
      next(error);
    }
  };

  get = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const article = await this.articleService.get(req.params.id, req.user!.userId);
      res.json(article);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { latexContent } = req.body;
      const article = await this.articleService.update(req.params.id, req.user!.userId, latexContent);
      res.json(article);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.articleService.delete(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getBibliography = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const bib = await this.articleService.generateBibliography(projectId, req.user!.userId);
      res.json({ bibliography: bib });
    } catch (error) {
      next(error);
    }
  };

  compile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const pdfBuffer = await this.articleService.compile(
        req.params.id, 
        req.user!.userId
      );
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="compiled.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };
}
