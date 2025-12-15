import mongoose from 'mongoose';
import { ResearchQuestionRepository } from '../repositories/ResearchQuestionRepository';
import { ProjectService } from './ProjectService';
import { NotFoundError } from '../utils/errors';

export class ResearchQuestionService {
  constructor(
    private rqRepo: ResearchQuestionRepository,
    private projectService: ProjectService
  ) {}

  async create(projectId: string, userId: string, data: any) {
    await this.projectService.checkMembership(projectId, userId);

    return await this.rqRepo.create({
      projectId: new mongoose.Types.ObjectId(projectId),
      question: data.question,
      description: data.description,
      codeIds: data.codeIds?.map((id: string) => new mongoose.Types.ObjectId(id)) || [],
      createdBy: new mongoose.Types.ObjectId(userId),
    });
  }

  async list(projectId: string, userId: string) {
    await this.projectService.checkMembership(projectId, userId);
    return await this.rqRepo.findByProjectId(projectId);
  }

  async get(id: string, userId: string) {
    const rq = await this.rqRepo.findById(id);
    if (!rq) throw new NotFoundError('Research question not found');
    
    await this.projectService.checkMembership(rq.projectId.toString(), userId);
    return rq;
  }

  async update(id: string, userId: string, data: any) {
    const rq = await this.get(id, userId);
    
    const updateData: any = { ...data };
    if (data.codeIds) {
      updateData.codeIds = data.codeIds.map((id: string) => new mongoose.Types.ObjectId(id));
    }
    
    return await this.rqRepo.update(id, updateData);
  }

  async delete(id: string, userId: string) {
    const rq = await this.get(id, userId);
    await this.rqRepo.delete(id);
  }

  async linkToMemo(id: string, memoId: string, userId: string) {
    const rq = await this.get(id, userId);
    
    if (!rq.memoIds.includes(memoId as any)) {
      rq.memoIds.push(memoId as any);
      await rq.save();
    }
    
    return rq;
  }

  async linkToQuotation(id: string, quotationId: string, userId: string) {
    const rq = await this.get(id, userId);
    
    if (!rq.quotationIds.includes(quotationId as any)) {
      rq.quotationIds.push(quotationId as any);
      await rq.save();
    }
    
    return rq;
  }
}
