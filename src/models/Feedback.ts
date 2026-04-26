import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  name: string;
  email: string;
  message: string;
  date: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
