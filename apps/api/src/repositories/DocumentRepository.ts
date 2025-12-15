import { DocumentModel, IDocument } from '../models/Document';

export class DocumentRepository {
  async create(data: Partial<IDocument>): Promise<IDocument> {
    const document = new DocumentModel(data);
    return await document.save();
  }
  
  async findById(id: string): Promise<IDocument | null> {
    return await DocumentModel.findById(id);
  }
  
  async findByProjectId(projectId: string): Promise<IDocument[]> {
    return await DocumentModel.find({ projectId });
  }
  
  async delete(id: string): Promise<void> {
    await DocumentModel.findByIdAndDelete(id);
  }
}
