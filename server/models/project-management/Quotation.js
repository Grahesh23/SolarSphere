import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema(
  {
    component: { type: String, required: true },
    category: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const quotationSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    status: { type: String, enum: ['Draft', 'Sent', 'Accepted', 'Rejected'], default: 'Draft' },
    items: { type: [quotationItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    createdAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    validUntil: { type: String, required: true },
    bomApproved: { type: Boolean, default: false },
    approvedBy: { type: String, default: '' },
    approvedAt: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);