import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  id: string;
  title: string;
  retailerId: string;
  pdfUrl?: string;
  image?: string;
  badge?: string;
  validFrom: Date;
  validUntil: Date;
  clicks: number;
  likes: number;
  dislikes: number;
  totalTimeSeconds: number;
  maxPagesViewed: number;
}

const OfferSchema = new Schema<IOffer>({
  id: { type: String, required: true, unique: true, lowercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  retailerId: { type: String, required: true, lowercase: true, trim: true },
  pdfUrl: { type: String, trim: true },
  image: { type: String, trim: true },
  badge: { type: String, trim: true },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  clicks: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  totalTimeSeconds: { type: Number, default: 0 },
  maxPagesViewed: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IOffer>('Offer', OfferSchema);
