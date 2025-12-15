import { Project, IProject } from '../models/Project';
import mongoose from 'mongoose';

export class ProjectRepository {
  async create(data: Partial<IProject>): Promise<IProject> {
    const project = new Project(data);
    return await project.save();
  }
  
  async findById(id: string): Promise<IProject | null> {
    return await Project.findById(id).populate('memberIds', 'name email');
  }
  
  async findByUserId(userId: string): Promise<IProject[]> {
    return await Project.find({
      memberIds: new mongoose.Types.ObjectId(userId),
    }).populate('memberIds', 'name email');
  }
  
  async update(id: string, data: Partial<IProject>): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(id, data, { new: true });
  }
  
  async delete(id: string): Promise<void> {
    await Project.findByIdAndDelete(id);
  }
  
  async isMember(projectId: string, userId: string): Promise<boolean> {
    const project = await Project.findOne({
      _id: projectId,
      memberIds: new mongoose.Types.ObjectId(userId),
    });
    return !!project;
  }
}
