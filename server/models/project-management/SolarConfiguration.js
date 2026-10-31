import mongoose from 'mongoose';

const bomLineSchema = new mongoose.Schema(
  {
    component: { type: String, required: true },
    category: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    required: { type: Boolean, default: true },
  },
  { _id: true }
);

const solarConfigurationSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    systemType: { type: String, enum: ['On-Grid', 'Off-Grid'], required: true },
    capacity: { type: Number, required: true, min: 1, max: 5 },
    panelCount: { type: Number, required: true, min: 1 },
    panelModel: { type: String, required: true },
    inverterModel: { type: String, required: true },
    batteryCount: { type: Number, default: 0, min: 0 },
    batteryModel: { type: String, default: '' },
    estimatedCost: { type: Number, required: true, min: 0 },
    estimatedAnnual: { type: Number, default: 0 },
    paybackYears: { type: Number, default: 0 },
    savingsMonthly: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Approved', 'Rejected'], default: 'Draft' },
    bom: { type: [bomLineSchema], default: [] },
    reasoning: { type: [String], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true }
);

export default mongoose.models.SolarConfiguration || mongoose.model('SolarConfiguration', solarConfigurationSchema);
