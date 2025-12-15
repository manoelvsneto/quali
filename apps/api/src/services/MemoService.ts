import mongoose from 'mongoose';
import { MemoRepository } from '../repositories/MemoRepository';
import { ProjectService } from './ProjectService';
import { NotFoundError } from '../utils/errors';

export class MemoService {
  constructor(
    private memoRepo: MemoRepository,
    private projectService: ProjectService
  ) {}
  
  async create(projectId: string, userId: string, data: any) {
    await this.projectService.checkMembership(projectId, userId);
    
    return await this.memoRepo.create({
      projectId: new mongoose.Types.ObjectId(projectId),
      content: data.content,
      documentId: data.documentId ? new mongoose.Types.ObjectId(data.documentId) : undefined,
      quotationId: data.quotationId ? new mongoose.Types.ObjectId(data.quotationId) : undefined,
      tags: data.tags || [],
      createdBy: new mongoose.Types.ObjectId(userId),
    });
  }
  
  async list(projectId: string, userId: string) {
    await this.projectService.checkMembership(projectId, userId);
    return await this.memoRepo.findByProjectId(projectId);
  }
  
  async update(id: string, userId: string, data: any) {
    const memo = await this.memoRepo.findById(id);
    if (!memo) throw new NotFoundError('Memo not found');
    
    await this.projectService.checkMembership(memo.projectId.toString(), userId);
    return await this.memoRepo.update(id, data);
  }
  
  async delete(id: string, userId: string) {
    const memo = await this.memoRepo.findById(id);
    if (!memo) throw new NotFoundError('Memo not found');
    
    await this.projectService.checkMembership(memo.projectId.toString(), userId);
    await this.memoRepo.delete(id);
  }
}
