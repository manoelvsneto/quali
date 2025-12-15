import { Memo, IMemo } from '../models/Memo';

export class MemoRepository {
  async create(data: Partial<IMemo>): Promise<IMemo> {
    const memo = new Memo(data);
    return await memo.save();
  }
  
  async findById(id: string): Promise<IMemo | null> {
    return await Memo.findById(id);
  }
  
  async findByProjectId(projectId: string): Promise<IMemo[]> {
    return await Memo.find({ projectId });
  }
  
  async update(id: string, data: Partial<IMemo>): Promise<IMemo | null> {
    return await Memo.findByIdAndUpdate(id, data, { new: true });
  }
  
  async delete(id: string): Promise<void> {
    await Memo.findByIdAndDelete(id);
  }
}
