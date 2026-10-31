import mongoose from 'mongoose';
import Customer from '../models/user-management/Customer.js';
import Project from '../models/project-management/Project.js';
import RoofSurvey from '../models/project-management/RoofSurvey.js';
import Quotation from '../models/project-management/Quotation.js';
import ApiError from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

const staffRoles = ['Admin', 'Sales', 'Surveyor'];

const requireStaff = (req, res, next) => {
  if (!staffRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to manage this workflow.'));
  }
  next();
};

const publicDoc = (document) => {
  const value = document.toObject ? document.toObject() : document;
  const result = JSON.parse(JSON.stringify(value));
  result.id = String(result._id);
  delete result._id;
  delete result.__v;
  if (Array.isArray(result.interactions)) {
    result.interactions = result.interactions.map((interaction) => ({
      ...interaction,
      id: String(interaction._id || interaction.id),
    }));
  }
  if (Array.isArray(result.items)) {
    result.items = result.items.map((item) => ({
      ...item,
      id: String(item._id || item.id),
      _id: undefined,
    }));
  }
  return result;
};

const makeCode = (prefix, id) => `${prefix}-${new Date().getFullYear()}-${id.toString().slice(-6).toUpperCase()}`;

export const getWorkflow = [
  requireStaff,
  async (req, res, next) => {
    try {
      const [customers, projects, surveys, quotations] = await Promise.all([
        Customer.find({ enquirySource: { $ne: 'Client registration' } }).sort({ createdAt: -1 }),
        Project.find().sort({ createdAt: -1 }),
        RoofSurvey.find().sort({ createdAt: -1 }),
        Quotation.find().sort({ createdAt: -1 }),
      ]);
      return sendSuccess(res, 200, {
        customers: customers.map(publicDoc),
        projects: projects.map(publicDoc),
        surveys: surveys.map(publicDoc),
        quotations: quotations.map(publicDoc),
      });
    } catch (error) {
      next(error);
    }
  },
];

export const createEnquiry = [
  requireStaff,
  async (req, res, next) => {
    try {
      const {
        name, email, phone, address, city, state, pincode,
        electricityConsumption, monthlyBill, desiredCapacity, enquirySource,
      } = req.body;
      if (!name?.trim() || !phone?.trim()) {
        return next(new ApiError(400, 'Customer name and phone are required.'));
      }

      const normalizedEmail = email?.trim().toLowerCase() || '';
      let customer = normalizedEmail ? await Customer.findOne({ email: normalizedEmail }) : null;
      if (customer?.leadStatus && customer.leadStatus !== 'New' && customer.leadStatus !== 'Contacted') {
        return next(new ApiError(409, 'An active enquiry already exists for this email.'));
      }

      const fields = {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        address: address?.trim() || '',
        city: city?.trim() || '',
        state: state?.trim() || '',
        pincode: pincode?.trim() || '',
        electricityConsumption: Number(electricityConsumption) || 0,
        monthlyBill: Number(monthlyBill) || 0,
        desiredCapacity: Number(desiredCapacity) || 3,
        enquirySource: enquirySource || 'Website',
        assignedTo: req.user.name,
        leadStatus: 'New',
      };

      if (customer) {
        Object.assign(customer, fields);
        await customer.save();
      } else {
        customer = new Customer(fields);
        await customer.save();
        customer.code = makeCode('CUST', customer._id);
        await customer.save();
      }
      return sendSuccess(res, 201, { customer: publicDoc(customer) }, 'Enquiry created.');
    } catch (error) {
      next(error);
    }
  },
];

export const addFollowUp = [
  requireStaff,
  async (req, res, next) => {
    try {
      const { type, note, date } = req.body;
      if (!note?.trim()) return next(new ApiError(400, 'Follow-up notes are required.'));
      const customer = await Customer.findById(req.params.customerId);
      if (!customer) return next(new ApiError(404, 'Enquiry not found.'));
      customer.interactions.unshift({
        date: date || new Date().toISOString().slice(0, 10),
        type: type || 'Call',
        note: note.trim(),
        by: req.user.name,
      });
      if (customer.leadStatus === 'New') customer.leadStatus = 'Contacted';
      await customer.save();
      return sendSuccess(res, 201, { customer: publicDoc(customer) }, 'Follow-up recorded.');
    } catch (error) {
      next(error);
    }
  },
];

export const scheduleSurvey = [
  requireStaff,
  async (req, res, next) => {
    try {
      const { scheduledDate, technicianId } = req.body;
      if (!scheduledDate) return next(new ApiError(400, 'Survey date is required.'));
      const customer = await Customer.findById(req.params.customerId);
      if (!customer) return next(new ApiError(404, 'Enquiry not found.'));

      const project = new Project({
        customerId: customer._id,
        capacity: Number(customer.desiredCapacity) || 3,
        status: 'Survey Scheduled',
        assignedTo: customer.assignedTo || req.user.name,
        startDate: new Date().toISOString().slice(0, 10),
        completion: 10,
        location: [customer.city, customer.state].filter(Boolean).join(', '),
      });
      project.code = makeCode('PRJ', project._id);
      await project.save();

      const survey = await RoofSurvey.create({
        projectId: project._id,
        customerId: customer._id,
        technicianId: mongoose.Types.ObjectId.isValid(technicianId) ? technicianId : null,
        assignedTo: technicianId || '',
        scheduledDate,
        status: 'Scheduled',
      });
      project.surveyId = survey._id;
      await project.save();
      customer.leadStatus = 'Survey Scheduled';
      await customer.save();

      return sendSuccess(
        res,
        201,
        { project: publicDoc(project), survey: publicDoc(survey), customer: publicDoc(customer) },
        'Roof survey scheduled.'
      );
    } catch (error) {
      next(error);
    }
  },
];

export const submitSurvey = [
  requireStaff,
  async (req, res, next) => {
    try {
      const survey = await RoofSurvey.findById(req.params.surveyId);
      if (!survey) return next(new ApiError(404, 'Survey not found.'));
      if (['Approved', 'Rejected'].includes(survey.status)) {
        return next(new ApiError(409, `A ${survey.status.toLowerCase()} survey cannot be edited.`));
      }

      const numericFields = ['roofLength', 'roofWidth', 'usableArea', 'tilt', 'cableDistance'];
      for (const field of numericFields) {
        if (req.body[field] !== undefined) {
          const value = Number(req.body[field]);
          if (!Number.isFinite(value) || value < 0) return next(new ApiError(400, `${field} must be a non-negative number.`));
          survey[field] = value;
        }
      }
      for (const field of ['orientation', 'shading', 'remarks']) {
        if (req.body[field] !== undefined) survey[field] = String(req.body[field]).trim();
      }
      if (req.body.obstacles !== undefined) {
        if (!Array.isArray(req.body.obstacles)) return next(new ApiError(400, 'Obstacles must be a list.'));
        survey.obstacles = req.body.obstacles.map((item) => String(item).trim()).filter(Boolean);
      }
      if (req.body.photos !== undefined) {
        if (!Array.isArray(req.body.photos)) return next(new ApiError(400, 'Photos must be a list.'));
        survey.photos = req.body.photos.map((item) => String(item).trim()).filter(Boolean);
      }
      survey.status = 'Submitted';
      await survey.save();
      return sendSuccess(res, 200, { survey: publicDoc(survey) }, 'Survey submitted for approval.');
    } catch (error) {
      next(error);
    }
  },
];

export const reviewSurvey = [
  requireStaff,
  async (req, res, next) => {
    try {
      const { decision } = req.body;
      if (!['approve', 'reject'].includes(decision)) return next(new ApiError(400, 'Decision must be approve or reject.'));
      const survey = await RoofSurvey.findById(req.params.surveyId);
      if (!survey) return next(new ApiError(404, 'Survey not found.'));
      if (survey.status !== 'Submitted') return next(new ApiError(409, 'Only submitted surveys can be reviewed.'));

      survey.status = decision === 'approve' ? 'Approved' : 'Rejected';
      if (decision === 'approve') {
        survey.approvedAt = new Date().toISOString().slice(0, 10);
        survey.approvedBy = req.user.name;
      }
      await survey.save();
      if (decision === 'approve') {
        await Project.findByIdAndUpdate(survey.projectId, { status: 'Survey Approved' });
      }
      return sendSuccess(res, 200, { survey: publicDoc(survey) }, `Survey ${survey.status.toLowerCase()}.`);
    } catch (error) {
      next(error);
    }
  },
];

export const createQuotation = [
  requireStaff,
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.projectId);
      if (!project) return next(new ApiError(404, 'Project not found.'));
      const survey = await RoofSurvey.findOne({ projectId: project._id, status: 'Approved' });
      if (!survey) return next(new ApiError(409, 'An approved roof survey is required before generating a quotation.'));
      if (project.quotationId || await Quotation.exists({ projectId: project._id })) {
        return next(new ApiError(409, 'A quotation already exists for this project.'));
      }

      const capacity = Math.max(1, Number(project.capacity) || 3);
      const items = [
        { component: 'Solar Panel 540W', category: 'Panel', qty: Math.ceil(capacity * 1000 / 540), unitPrice: 16500 },
        { component: project.gridType === 'Off-Grid' ? 'Off-Grid Inverter' : 'String Inverter', category: 'Inverter', qty: 1, unitPrice: 62000 },
        { component: 'Mounting Structure Kit', category: 'Mounting', qty: capacity, unitPrice: 6000 },
        { component: 'DC & AC Cabling', category: 'Cable', qty: 1, unitPrice: 12000 },
      ];
      const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
      const tax = Math.round(subtotal * 0.08);
      const quotation = new Quotation({
        code: makeCode('QTN', new mongoose.Types.ObjectId()),
        projectId: project._id,
        customerId: project.customerId,
        items,
        subtotal,
        tax,
        total: subtotal + tax,
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      });
      quotation.code = makeCode('QTN', quotation._id);
      await quotation.save();
      project.quotationId = quotation._id;
      project.totalCost = quotation.total;
      project.status = 'Quotation Draft';
      await project.save();
      await Customer.findByIdAndUpdate(project.customerId, { leadStatus: 'Quoted' });
      return sendSuccess(res, 201, { quotation: publicDoc(quotation) }, 'Quotation generated from the approved survey.');
    } catch (error) {
      next(error);
    }
  },
];

export const updateQuotation = [
  requireStaff,
  async (req, res, next) => {
    try {
      const { action } = req.body;
      const quotation = await Quotation.findById(req.params.quotationId);
      if (!quotation) return next(new ApiError(404, 'Quotation not found.'));
      if (action === 'approve') {
        if (req.user.role !== 'Admin') {
          return next(new ApiError(403, 'Only administrators can approve a quotation BOM.'));
        }
        quotation.bomApproved = true;
        quotation.approvedBy = req.user.name;
        quotation.approvedAt = new Date().toISOString().slice(0, 10);
      } else if (action === 'send') {
        if (!['Admin', 'Sales'].includes(req.user.role)) {
          return next(new ApiError(403, 'Only administrators or sales employees can send quotations.'));
        }
        if (!quotation.bomApproved) return next(new ApiError(409, 'Approve the BOM before sending the quotation.'));
        if (quotation.status !== 'Draft') return next(new ApiError(409, 'Only draft quotations can be sent.'));
        quotation.status = 'Sent';
      } else {
        return next(new ApiError(400, 'Action must be approve or send.'));
      }
      await quotation.save();
      if (action === 'send') await Project.findByIdAndUpdate(quotation.projectId, { status: 'Quotation Sent' });
      return sendSuccess(res, 200, { quotation: publicDoc(quotation) }, `Quotation ${action === 'send' ? 'sent' : 'BOM approved'}.`);
    } catch (error) {
      next(error);
    }
  },
];

export const decideQuotation = async (req, res, next) => {
  try {
    if (!['Client', 'Customer'].includes(req.user.role)) {
      return next(new ApiError(403, 'Only clients can respond to a quotation.'));
    }
    const { decision } = req.body;
    if (!['accept', 'reject'].includes(decision)) return next(new ApiError(400, 'Decision must be accept or reject.'));
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) return next(new ApiError(404, 'Customer profile not found.'));
    const quotation = await Quotation.findOne({ _id: req.params.quotationId, customerId: customer._id, status: 'Sent' });
    if (!quotation) return next(new ApiError(404, 'Sent quotation not found.'));
    quotation.status = decision === 'accept' ? 'Accepted' : 'Rejected';
    await quotation.save();
    if (decision === 'accept') await Project.findByIdAndUpdate(quotation.projectId, { status: 'Customer Approved' });
    return sendSuccess(res, 200, { quotation: publicDoc(quotation) }, `Quotation ${quotation.status.toLowerCase()}.`);
  } catch (error) {
    next(error);
  }
};
