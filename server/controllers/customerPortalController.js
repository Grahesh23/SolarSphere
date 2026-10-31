import mongoose from 'mongoose';
import Customer from '../models/user-management/Customer.js';
import ApiError from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

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

  customer.userId = user._id;
  customer.name = user.name;
  customer.email = user.email;
  customer.phone = user.phone || customer.phone;
  customer.companyName = user.companyName || customer.companyName;
  await customer.save();

  if (!user.customerId || user.customerId.toString() !== customer._id.toString()) {
    user.customerId = customer._id;
    await user.save();
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
    const projects = await findCustomerRecords('projects', customer._id);
    const projectIds = projects.map((project) => new mongoose.Types.ObjectId(project.id));

    const configIds = projects.map((project) => project.configId).filter(Boolean);
    const equipment = await findCustomerRecords('equipmentunits', customer._id, projectIds);
    const productIds = equipment.map((unit) => unit.itemId).filter(Boolean);

    const [
      surveys,
      quotations,
      payments,
      services,
      warranties,
      installations,
      notifications,
      technicians,
    ] = await Promise.all([
      findCustomerRecords('roofsurveys', customer._id, projectIds),
      findCustomerRecords('quotations', customer._id, projectIds),
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

export { ensureCustomerProfile };
