import mongoose, { Schema, Document } from 'mongoose';

export interface IAIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IAIConversation extends Document {
  userId: string;
  title: string;
  messages: IAIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AIConversationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'Career Strategy Session' },
    messages: [AIMessageSchema],
  },
  { timestamps: true }
);

export const AIConversation = mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);
