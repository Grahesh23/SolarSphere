import mongoose from 'mongoose';

const roofSurveySchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedTo: { type: String, default: '' },
    scheduledDate: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'In Progress', 'Submitted', 'Approved', 'Rejected'], default: 'Scheduled' },
    roofLength: { type: Number, default: 0 },
    roofWidth: { type: Number, default: 0 },
    usableArea: { type: Number, default: 0 },
    orientation: { type: String, default: '' },
    tilt: { type: Number, default: 0 },
    shading: { type: String, default: 'None' },
    obstacles: { type: [String], default: [] },
    cableDistance: { type: Number, default: 0 },
    photos: { type: [String], default: [] },
    remarks: { type: String, default: '' },
    approvedAt: { type: String, default: '' },
    approvedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.RoofSurvey || mongoose.model('RoofSurvey', roofSurveySchema);