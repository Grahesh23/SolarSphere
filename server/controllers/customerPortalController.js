import mongoose from 'mongoose';
import Customer from '../models/user-management/Customer.js';
import ApiError from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import Project from '../models/project-management/Project.js';
import RoofSurvey from '../models/project-management/RoofSurvey.js';
import Quotation from '../models/project-management/Quotation.js';

const ensureCustomerProfile = async (user) => {
  let customer = user.customerId
    ? await Customer.findById(user.customerId)
    : await Customer.findOne({ userId: user._id });

  if (!customer) {
    customer = await Customer.findOne({ email: user.email });
  }

  if (customer?.userId && customer.userId.toString() !== user._id.toString()) {
    throw new ApiError(409, 'A customer profile with this email is already linked to another account.');
  }

  if (!customer) {
    customer = new Customer({
      name: user.name,
      email: user.email,
      phone: user.phone,
      companyName: user.companyName,
      enquirySource: 'Client registration',
    });
  }

  const isNewCustomer = customer.isNew;
  customer.userId = user._id;
  customer.name = user.name;
  customer.email = user.email;
  customer.phone = user.phone || customer.phone;
  customer.companyName = user.companyName || customer.companyName;
  await customer.save();

  if (!user.customerId || user.customerId.toString() !== customer._id.toString()) {
    user.customerId = customer._id;
    try {
      await user.save();
    } catch (error) {
      try {
        if (isNewCustomer) {
          await customer.deleteOne();
        } else {
          customer.userId = undefined;
          await customer.save();
        }
      } catch (cleanupError) {
        console.error('Failed to roll back customer profile linking:', cleanupError);
      }
      throw error;
    }
  }

  return customer;
};

const serialize = (document) => {
  const { _id, __v, ...fields } = document;
  return JSON.parse(JSON.stringify({ id: _id, ...fields }));
};

const findCustomerRecords = async (collectionName, customerId, projectIds = [], userId = null) => {
  const alternatives = [
    { customerId },
    { customerId: customerId.toString() },
  ];

  if (userId) {
    alternatives.push({ userId }, { userId: userId.toString() });
  }

  if (projectIds.length) {
    alternatives.push(
      { projectId: { $in: projectIds } },
      { projectId: { $in: projectIds.map((id) => id.toString()) } }
    );
  }

  const records = await mongoose.connection
    .collection(collectionName)
    .find({ $or: alternatives })
    .toArray();
  return records.map(serialize);
};

const findRecordsByIds = async (collectionName, ids) => {
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const alternatives = [];
  if (objectIds.length) alternatives.push({ _id: { $in: objectIds } });
  if (ids.length) alternatives.push({ _id: { $in: ids } });
  if (alternatives.length === 0) return [];

  const records = await mongoose.connection
    .collection(collectionName)
    .find({ $or: alternatives })
    .toArray();
  return records.map(serialize);
};

export const getCustomerPortal = async (req, res, next) => {
  try {
    if (req.user.role !== 'Client' && req.user.role !== 'Customer') {
      return next(new ApiError(403, 'The customer portal is only available to client accounts.'));
    }

    const customer = await ensureCustomerProfile(req.user);
    const [projectDocuments, surveyDocuments, quotationDocuments] = await Promise.all([
      Project.find({ customerId: customer._id }).sort({ createdAt: -1 }),
      RoofSurvey.find({ customerId: customer._id }).sort({ scheduledDate: -1 }),
      Quotation.find({ customerId: customer._id }).sort({ createdAt: -1 }),
    ]);
    const projects = projectDocuments.map(serialize);
    const surveys = surveyDocuments.map(serialize);
    const quotations = quotationDocuments.map((quotation) => ({
      ...serialize(quotation),
      items: quotation.items.map((item) => ({
        ...serialize(item),
        id: item._id.toString(),
      })),
    }));
    const projectIds = projects.map((project) => project.id);

    const configIds = projects.map((project) => project.configId).filter(Boolean);
    const equipment = await findCustomerRecords('equipmentunits', customer._id, projectIds);
    const productIds = equipment.map((unit) => unit.itemId).filter(Boolean);

    const [
      payments,
      services,
      warranties,
      installations,
      notifications,
      technicians,
    ] = await Promise.all([
      findCustomerRecords('payments', customer._id, projectIds),
      findCustomerRecords('servicetickets', customer._id, projectIds),
      findCustomerRecords('warranties', customer._id, projectIds),
      findCustomerRecords('installations', customer._id, projectIds),
      findCustomerRecords('notifications', customer._id, projectIds, req.user._id),
      findCustomerRecords('technicianprofiles', customer._id, projectIds),
    ]);
    const [configs, inventory] = await Promise.all([
      findRecordsByIds('solarconfigurations', configIds),
      findRecordsByIds('products', productIds),
    ]);

    return sendSuccess(
      res,
      200,
      {
        customer: serialize(customer.toObject()),
        projects,
        surveys,
        configs,
        quotations,
        payments,
        services,
        equipment,
        warranties,
        installations,
        notifications,
        inventory,
        technicians,
      },
      'Customer portal data retrieved successfully.'
    );
  } catch (error) {
    next(error);
  }
};

export const submitCustomerEnquiry = async (req, res, next) => {
  try {
    if (!['Client', 'Customer'].includes(req.user.role)) {
      return next(new ApiError(403, 'Only client accounts can submit a customer enquiry.'));
    }

    const { phone, address, city, state, pincode, electricityConsumption, monthlyBill, desiredCapacity } = req.body;
    if (!phone?.trim()) {
      return next(new ApiError(400, 'A contact phone number is required.'));
    }

    const capacity = Number(desiredCapacity);
    if (!Number.isFinite(capacity) || capacity <= 0 || capacity > 100) {
      return next(new ApiError(400, 'Desired system capacity must be greater than 0 and no more than 100 kW.'));
    }

    const numericFields = [
      ['electricityConsumption', electricityConsumption],
      ['monthlyBill', monthlyBill],
    ];
    for (const [field, value] of numericFields) {
      if (value !== undefined && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
        return next(new ApiError(400, `${field} must be a non-negative number.`));
      }
    }

    const customer = await ensureCustomerProfile(req.user);
    if (customer.enquirySource !== 'Client registration') {
      return next(new ApiError(409, 'An enquiry is already on file for your account.'));
    }

    customer.phone = phone.trim();
    customer.address = address?.trim() || '';
    customer.city = city?.trim() || '';
    customer.state = state?.trim() || '';
    customer.pincode = pincode?.trim() || '';
    customer.electricityConsumption = Number(electricityConsumption) || 0;
    customer.monthlyBill = Number(monthlyBill) || 0;
    customer.desiredCapacity = capacity;
    customer.enquirySource = 'Client Portal';
    customer.leadStatus = 'New';
    await customer.save();

    return sendSuccess(res, 201, { customer: serialize(customer.toObject()) }, 'Your solar enquiry was submitted.');
  } catch (error) {
    next(error);
  }
};

export { ensureCustomerProfile };
