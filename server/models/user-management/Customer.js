import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    pincode: {
      type: String,
      default: '',
      trim: true,
    },
    electricityConsumption: {
      type: Number,
      default: 0,
    },
    monthlyBill: {
      type: Number,
      default: 0,
    },
    desiredCapacity: {
      type: Number,
      default: 0,
    },
    enquirySource: {
      type: String,
      default: 'Client registration',
    },
    leadStatus: {
      type: String,
      default: 'New',
    },
    interactions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

customerSchema.pre('validate', function setCustomerCode() {
  if (!this.code && this._id) {
    this.code = `CUST-${this._id.toString().slice(-6).toUpperCase()}`;
  }
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;