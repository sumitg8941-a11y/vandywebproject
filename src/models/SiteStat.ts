import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteStat extends Document {
  id: string;
  visits: number;
}

const SiteStatSchema = new Schema<ISiteStat>({
  id: { type: String, required: true, unique: true },
  visits: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<ISiteStat>('SiteStat', SiteStatSchema);
