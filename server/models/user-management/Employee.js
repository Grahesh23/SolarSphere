import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

employeeSchema.pre('validate', function setEmployeeCode() {
  if (!this.code && this._id) {
    this.code = `EMP-${this._id.toString().slice(-6).toUpperCase()}`;
  }
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
