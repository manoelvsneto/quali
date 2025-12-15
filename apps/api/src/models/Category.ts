import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  parentId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
