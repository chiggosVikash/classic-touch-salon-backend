import mongoose, { Document, Schema } from 'mongoose';

export interface IBill extends Document {
  employeeId: mongoose.Types.ObjectId;
  amount: number;
  tip: number;
  discount: number;
  paymentMethod: 'cash' | 'online';
  date: Date;
  services: mongoose.Types.ObjectId[];
  user: {
    name: string;
    number: number;
  };
}

const BillSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    amount: { type: Number, required: true },
    tip: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['cash', 'online'], required: true },
    date: { type: Date, default: Date.now },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    user: {
      name: { type: String, required: false },
      number: { type: Number, required: false },
    }
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt fields
    versionKey: false, // Disables the __v field
  }
);

export default mongoose.model<IBill>('Bill', BillSchema);
