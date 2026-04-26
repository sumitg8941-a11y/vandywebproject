import mongoose, { Schema, Document } from 'mongoose';

export interface IRetailer extends Document {
  id: string;
  name: string;
  cityId: string;
  websiteUrl?: string;
  image: string;
  clicks: number;
}

const RetailerSchema = new Schema<IRetailer>({
  id: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  cityId: { type: String, required: true, lowercase: true, trim: true },
  websiteUrl: { type: String, trim: true },
  image: { type: String, required: true },
  clicks: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IRetailer>('Retailer', RetailerSchema);
