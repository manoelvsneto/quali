import mongoose from 'mongoose';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ProjectService {
  constructor(private projectRepo: ProjectRepository) {}
  
  private isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }
  
  async create(name: string, description: string | undefined, userId: string, memberIds?: string[], authors?: any[]) {
    logger.debug({ userId }, 'ProjectService.create - checking userId');
    
    if (!this.isValidObjectId(userId)) {
      logger.error({ userId }, 'Invalid user ID format in create');
      throw new ValidationError('Invalid user ID format. Please logout and login again.');
    }
    
    const members = [new mongoose.Types.ObjectId(userId)];
    
    if (memberIds?.length) {
      for (const id of memberIds) {
        if (!this.isValidObjectId(id)) {
          throw new ValidationError(`Invalid member ID format: ${id}`);
        }
        members.push(new mongoose.Types.ObjectId(id));
      }
    }
    
    const project = await this.projectRepo.create({
      name,
      description,
      memberIds: members,
      createdBy: new mongoose.Types.ObjectId(userId),
      authors: authors || [],
    });
    
    return await this.projectRepo.findById(project._id.toString());
  }
  
  async list(userId: string) {
    logger.debug({ userId }, 'ProjectService.list - checking userId');
    
    if (!this.isValidObjectId(userId)) {
      logger.error({ userId }, 'Invalid user ID format in list');
      throw new ValidationError('Invalid user ID format. Please logout and login again.');
    }
    return await this.projectRepo.findByUserId(userId);
  }
  
  async get(id: string, userId: string) {
    logger.debug({ projectId: id, userId }, 'ProjectService.get called');
    
    if (!this.isValidObjectId(id)) {
      logger.error({ projectId: id }, 'Invalid project ID format');
      throw new ValidationError(`Invalid project ID format: ${id}`);
    }
    if (!this.isValidObjectId(userId)) {
      logger.error({ userId }, 'Invalid user ID format');
      throw new ValidationError('Invalid user ID format');
    }
    
    const project = await this.projectRepo.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    const isMember = await this.projectRepo.isMember(id, userId);
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this project');
    }
    
    return project;
  }
  
  async update(id: string, userId: string, data: any) {
    if (!this.isValidObjectId(id)) {
      throw new ValidationError('Invalid project ID format');
    }
    await this.get(id, userId);
    
    // Sanitize authors data
    if (data.authors) {
      data.authors = data.authors.map((author: any) => ({
        name: author.name,
        affiliation: author.affiliation || undefined,
        email: author.email || undefined,
        orcid: author.orcid || undefined,
      }));
    }
    
    return await this.projectRepo.update(id, data);
  }
  
  async delete(id: string, userId: string) {
    if (!this.isValidObjectId(id)) {
      throw new ValidationError('Invalid project ID format');
    }
    const project = await this.get(id, userId);
    
    if (project.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only project creator can delete');
    }
    
    await this.projectRepo.delete(id);
  }
  
  async checkMembership(projectId: string, userId: string): Promise<void> {
    if (!this.isValidObjectId(projectId)) {
      throw new ValidationError('Invalid project ID format');
    }
    if (!this.isValidObjectId(userId)) {
      throw new ValidationError('Invalid user ID format');
    }
    
    const isMember = await this.projectRepo.isMember(projectId, userId);
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this project');
    }
  }
}
