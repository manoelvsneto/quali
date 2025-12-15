import mongoose, { Document, Schema, model } from 'mongoose';

export interface ICode extends Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  color: string;
  description?: string;
  categoryId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const codeSchema = new Schema<ICode>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  description: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// IMPORTANTE: Usar apenas model() sem verificação
export const Code = model<ICode>('Code', codeSchema);
