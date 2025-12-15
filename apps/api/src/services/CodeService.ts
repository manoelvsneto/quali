import mongoose from 'mongoose';
import { CodeRepository } from '../repositories/CodeRepository';
import { ProjectService } from './ProjectService';
import { NotFoundError } from '../utils/errors';

export class CodeService {
  constructor(
    private codeRepo: CodeRepository,
    private projectService: ProjectService
  ) {}
  
  async createCode(projectId: string, userId: string, data: any) {
    await this.projectService.checkMembership(projectId, userId);
    
    return await this.codeRepo.createCode({
      projectId: new mongoose.Types.ObjectId(projectId),
      ...data,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
  }
  
  async createCategory(projectId: string, userId: string, name: string, parentId?: string) {
    await this.projectService.checkMembership(projectId, userId);
    
    return await this.codeRepo.createCategory({
      projectId: new mongoose.Types.ObjectId(projectId),
      name,
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : undefined,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
  }
  
  async listCodes(projectId: string, userId: string) {
    await this.projectService.checkMembership(projectId, userId);
    return await this.codeRepo.findCodesByProjectId(projectId);
  }
  
  async listCategories(projectId: string, userId: string) {
    await this.projectService.checkMembership(projectId, userId);
    return await this.codeRepo.findCategoriesByProjectId(projectId);
  }
  
  async updateCode(id: string, userId: string, data: any) {
    const code = await this.codeRepo.findCodeById(id);
    if (!code) throw new NotFoundError('Code not found');
    
    await this.projectService.checkMembership(code.projectId.toString(), userId);
    return await this.codeRepo.updateCode(id, data);
  }
  
  async deleteCode(id: string, userId: string) {
    const code = await this.codeRepo.findCodeById(id);
    if (!code) throw new NotFoundError('Code not found');
    
    await this.projectService.checkMembership(code.projectId.toString(), userId);
    await this.codeRepo.deleteCode(id);
  }
}
