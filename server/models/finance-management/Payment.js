import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'TechnicianProfile', default: null },
    type: {
      type: String,
      enum: ['Advance', 'Installment', 'Final', 'Supplier', 'Technician', 'Additional Charge', 'Adjustment'],
      default: 'Advance',
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid', 'Pending', 'Overdue', 'Cancelled'],
      default: 'Unpaid',
    },
    amount: { type: Number, default: 0 },
    date: { type: String, default: '' },
    dueDate: { type: String, default: '' },
    method: { type: String, default: 'Bank Transfer' },
    reference: { type: String, default: '' },
    party: { type: String, default: '' },
    remarks: { type: String, default: '' },
    history: [{
      action: String,
      amount: Number,
      at: String,
      by: String,
    }],
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
