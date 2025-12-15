import { Code, ICode } from '../models/Code';
import { Category, ICategory } from '../models/Category';

export class CodeRepository {
  async createCode(data: Partial<ICode>): Promise<ICode> {
    const code = new Code(data);
    return await code.save();
  }
  
  async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    const category = new Category(data);
    return await category.save();
  }
  
  async findCodesByProjectId(projectId: string): Promise<ICode[]> {
    return await Code.find({ projectId }).populate('categoryId');
  }
  
  async findCategoriesByProjectId(projectId: string): Promise<ICategory[]> {
    return await Category.find({ projectId });
  }
  
  async findCodeById(id: string): Promise<ICode | null> {
    return await Code.findById(id);
  }
  
  async findCategoryById(id: string): Promise<ICategory | null> {
    return await Category.findById(id);
  }
  
  async updateCode(id: string, data: Partial<ICode>): Promise<ICode | null> {
    return await Code.findByIdAndUpdate(id, data, { new: true });
  }
  
  async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(id, data, { new: true });
  }
  
  async deleteCode(id: string): Promise<void> {
    await Code.findByIdAndDelete(id);
  }
  
  async deleteCategory(id: string): Promise<void> {
    await Category.findByIdAndDelete(id);
  }
}
