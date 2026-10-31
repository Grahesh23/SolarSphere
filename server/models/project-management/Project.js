import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    capacity: { type: Number, required: true },
    gridType: { type: String, enum: ['On-Grid', 'Off-Grid', 'Hybrid'], default: 'On-Grid' },
    status: { type: String, default: 'Enquiry' },
    assignedEmployees: { type: [String], default: [] },
    assignedTo: { type: String, default: '' },
    startDate: { type: String, default: '' },
    targetEndDate: { type: String, default: '' },
    completion: { type: Number, default: 0 },
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoofSurvey', default: null },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
    configId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarConfiguration', default: null },
    totalCost: { type: Number, default: 0 },
    location: { type: String, default: '' },
  },
  { timestamps: true }
);

projectSchema.pre('validate', function setProjectCode() {
  if (!this.code && this._id) {
    this.code = `PRJ-${new Date().getFullYear()}-${this._id.toString().slice(-6).toUpperCase()}`;
  }
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);