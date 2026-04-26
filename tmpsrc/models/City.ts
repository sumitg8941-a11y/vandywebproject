import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  id: string;
  name: string;
  countryId: string;
  stateId?: string;
  image: string;
}

const CitySchema = new Schema<ICity>({
  id: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  countryId: { type: String, required: true, lowercase: true, trim: true },
  stateId: { type: String, lowercase: true, trim: true },
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ICity>('City', CitySchema);
