import mongoose, { Schema, Document } from 'mongoose';

export interface ICountry extends Document {
  id: string;
  name: string;
  image: string;
}

const CountrySchema = new Schema<ICountry>({
  id: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ICountry>('Country', CountrySchema);
