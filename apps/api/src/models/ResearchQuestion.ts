import { Schema, model } from 'mongoose';

const researchQuestionSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  description: String,
  codeIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Code',
  }],
  memoIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Memo',
  }],
  quotationIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Quotation',
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export const ResearchQuestion = model('ResearchQuestion', researchQuestionSchema);
