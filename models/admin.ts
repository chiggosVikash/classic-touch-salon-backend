import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAdmin extends Document {
  name: string;
  email: string;
  number: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String, required: false },
    password: { type: String, required: true },
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt fields
    versionKey: false, // Disables the __v field
  }
);

AdminSchema.pre<IAdmin>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAdmin>('Admin', AdminSchema);
