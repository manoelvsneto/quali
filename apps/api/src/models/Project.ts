import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  memberIds: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  memberIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authors: [{
    name: { type: String, required: true },
    affiliation: { type: String },
    email: { type: String },
    orcid: { type: String },
  }],
}, {
  timestamps: true,
});

export const Project = mongoose.model<IProject>('Project', projectSchema);
