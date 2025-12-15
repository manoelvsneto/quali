import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
  constructor(private authService: AuthService) {}
  
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.register(name, email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
  
  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refresh(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
  
  me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.me(req.user!.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
