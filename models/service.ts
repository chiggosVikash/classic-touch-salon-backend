import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  amount: number;
  description: string;
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true }
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt fields
    versionKey: false, // Disables the __v field
  }
);

export default mongoose.model<IService>('Service', ServiceSchema);
