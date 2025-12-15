import { Schema, model } from 'mongoose';

const articleSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  latexContent: {
    type: String,
    default: '',
  },
  compiledPdf: {
    type: String, // Path to compiled PDF
  },
  metadata: {
    documentClass: { type: String, default: 'article' },
    fontSize: { type: String, default: '12pt' },
    paperSize: { type: String, default: 'a4paper' },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export const Article = model('Article', articleSchema);
