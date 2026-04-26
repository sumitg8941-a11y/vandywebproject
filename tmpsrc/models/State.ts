import mongoose, { Schema, Document } from 'mongoose';

export interface IState extends Document {
  id: string;
  name: string;
  countryId: string;
  image: string;
}

const StateSchema = new Schema<IState>({
  id: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  countryId: { type: String, required: true, lowercase: true, trim: true },
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IState>('State', StateSchema);
