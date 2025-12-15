import { Article } from '../models/Article';

export class ArticleRepository {
  async create(data: any) {
    return await Article.create(data);
  }

  async findById(id: string) {
    // Não fazer populate do projectId para evitar passar objeto ao invés de string
    return await Article.findById(id);
  }

  async findByProjectId(projectId: string) {
    return await Article.find({ projectId }).sort({ createdAt: -1 });
  }

  async update(id: string, data: any) {
    return await Article.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await Article.findByIdAndDelete(id);
  }
}
