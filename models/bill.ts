import mongoose, { Document, Schema } from 'mongoose';

export interface IBill extends Document {
  employeeId: mongoose.Types.ObjectId;
  amount: number;
  tipAmount: number;
  discountAmount: number;
  paymentMode: 'cash' | 'online';
  paymentDate: string;
  serviceIds: mongoose.Types.ObjectId[];
  customerName: string;
  customerPhoneNumber: string;
 
}

const BillSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    amount: { type: Number, required: true },
    tipAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    paymentMode: { type: String, enum: ['cash', 'online'], required: true },
    paymentDate: { type: String, required:true},
    serviceIds: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    customerName: { type: String },
    customerPhoneNumber: { type: String },
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt fields
    versionKey: false, // Disables the __v field
  }
);

export default mongoose.model<IBill>('Bill', BillSchema);
