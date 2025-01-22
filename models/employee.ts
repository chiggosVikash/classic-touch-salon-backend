import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  number: string;
}

const EmployeeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: false },
    number: { type: String, required: false },
    gender: { type: String, required: false }
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt fields
    versionKey: false, // Disables the __v field
  }
);

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
