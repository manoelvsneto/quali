import mongoose, { Document, Schema } from 'mongoose';

export interface IMemo extends Document {
  projectId: mongoose.Types.ObjectId;
  content: string;
  documentId?: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const memoSchema = new Schema<IMemo>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  content: { type: String, required: true },
  documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
  quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
  tags: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Memo = mongoose.model<IMemo>('Memo', memoSchema);
