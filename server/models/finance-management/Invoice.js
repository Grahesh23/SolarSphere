import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true },
    invoiceDate: { type: String, default: '' },
    dueDate: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Unpaid',
    },
    items: { type: [invoiceItemSchema], default: [] },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
