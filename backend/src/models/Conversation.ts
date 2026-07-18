import { Schema, model, Types } from 'mongoose';

export interface IConversation {
  user: Types.ObjectId;
  document: Types.ObjectId;
  question: string;
  aiResponse: string;
  createdAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  document: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  question: { type: String, required: true },
  aiResponse: { type: String, required: true }
}, { timestamps: true });

export const Conversation = model<IConversation>('Conversation', ConversationSchema);