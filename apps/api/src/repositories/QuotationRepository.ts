import { Quotation, IQuotation } from '../models/Quotation';

export class QuotationRepository {
  async create(data: any) {
    return await Quotation.create(data);
  }

  async findById(id: string) {
    return await Quotation.findById(id).populate('codeIds');
  }

  async findByDocumentId(documentId: string) {
    return await Quotation.find({ documentId })
      .populate('codeIds')
      .sort({ startOffset: 1 });
  }

  async findByProjectId(projectId: string, filters?: any) {
    const query: any = { projectId };
    
    if (filters?.codeIds?.length) {
      query.codeIds = { $in: filters.codeIds };
    }
    
    return await Quotation.find(query)
      .populate('codeIds')
      .populate('documentId', 'title')
      .sort({ createdAt: -1 });
  }

  async update(id: string, data: any) {
    return await Quotation.findByIdAndUpdate(id, data, { new: true })
      .populate('codeIds');
  }

  async delete(id: string) {
    return await Quotation.findByIdAndDelete(id);
  }
}
