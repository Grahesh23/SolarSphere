import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    category: {
      type: String,
      enum: [
        'Equipment purchases',
        'Installation materials',
        'Transportation',
        'Technician payments',
        'Maintenance',
        'Office/Operational',
        'Other expenses',
      ],
      default: 'Other expenses',
    },
    description: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    date: { type: String, default: '' },
    supplier: { type: String, default: '' },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    receiptRef: { type: String, default: '' },
    status: { type: String, default: 'Recorded' },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
