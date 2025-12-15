import { Schema, model } from 'mongoose';

const quotationSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  exactText: {
    type: String,
    required: true,
  },
  startOffset: {
    type: Number,
    required: true,
  },
  endOffset: {
    type: Number,
    required: true,
  },
  codeIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Code',
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export const Quotation = model('Quotation', quotationSchema);
