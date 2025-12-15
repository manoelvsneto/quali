import { ResearchQuestion } from '../models/ResearchQuestion';

export class ResearchQuestionRepository {
  async create(data: any) {
    return await ResearchQuestion.create(data);
  }

  async findByProjectId(projectId: string) {
    return await ResearchQuestion.find({ projectId })
      .populate('codeIds')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async findById(id: string) {
    return await ResearchQuestion.findById(id)
      .populate('codeIds')
      .populate('memoIds')
      .populate('quotationIds');
  }

  async update(id: string, data: any) {
    return await ResearchQuestion.findByIdAndUpdate(id, data, { new: true })
      .populate('codeIds');
  }

  async delete(id: string) {
    return await ResearchQuestion.findByIdAndDelete(id);
  }
}
