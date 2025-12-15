import mongoose from 'mongoose';
import { QuotationRepository } from '../repositories/QuotationRepository';
import { DocumentService } from './DocumentService';

export class QuotationService {
  constructor(
    private quotationRepo: QuotationRepository,
    private documentService: DocumentService
  ) {}
  
  async create(userId: string, data: any) {
    const document = await this.documentService.get(data.documentId, userId);
    
    return await this.quotationRepo.create({
      projectId: document.projectId,
      documentId: new mongoose.Types.ObjectId(data.documentId),
      startOffset: data.startOffset,
      endOffset: data.endOffset,
      exactText: data.exactText,
      codeIds: data.codeIds.map((id: string) => new mongoose.Types.ObjectId(id)),
      createdBy: new mongoose.Types.ObjectId(userId),
    });
  }
  
  async listByDocument(documentId: string, userId: string) {
    await this.documentService.get(documentId, userId);
    return await this.quotationRepo.findByDocumentId(documentId);
  }
  
  async update(id: string, userId: string, codeIds: string[]) {
    const quotation = await this.quotationRepo.findById(id);
    if (!quotation) throw new Error('Quotation not found');
    
    await this.documentService.get(quotation.documentId.toString(), userId);
    
    return await this.quotationRepo.update(id, {
      codeIds: codeIds.map(id => new mongoose.Types.ObjectId(id)),
    });
  }
  
  async delete(id: string, userId: string) {
    const quotation = await this.quotationRepo.findById(id);
    if (!quotation) throw new NotFoundError('Quotation not found');
    
    // Verificar se o usuário tem acesso ao documento relacionado
    await this.documentService.get(quotation.documentId.toString(), userId);
    
    await this.quotationRepo.delete(id);
  }
  
  async query(projectId: string, userId: string, filters: any) {
    // Verify membership through any document in project
    const documents = await this.documentService.list(projectId, userId);
    
    return await this.quotationRepo.findByProjectId(projectId, filters);
  }
}
