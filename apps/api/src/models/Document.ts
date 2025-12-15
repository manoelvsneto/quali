import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  type: string;
  originalFilename: string;
  textContent: string;
  uploadPath: string;
  metadata: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  originalFilename: { type: String, required: true },
  textContent: { type: String, required: true },
  uploadPath: { type: String, required: true },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  bibtex: {
    type: String,
    default: '',
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
