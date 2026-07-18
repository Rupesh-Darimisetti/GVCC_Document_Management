import { Schema, model, Types } from 'mongoose';

export interface IDocument {
  name: string;
  fileType: 'pdf' | 'txt' | 'md';
  rawText: string;
  fileSize: number;
  owner: Types.ObjectId;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  name: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'txt', 'md'], required: true },
  rawText: { type: String, required: true },
  fileSize: { type: Number, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Document = model<IDocument>('Document', DocumentSchema);