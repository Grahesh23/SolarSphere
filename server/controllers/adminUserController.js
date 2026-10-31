import Customer from '../models/user-management/Customer.js';
import Employee from '../models/user-management/Employee.js';
import User from '../models/user-management/User.js';
import ApiError from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';

const EMPLOYEE_ROLES = ['Sales', 'Surveyor', 'Warehouse', 'Technician', 'Service', 'Finance'];

const employeeResponse = (employee) => ({
  id: employee._id,
  code: employee.code,
  name: employee.userId.name,
  email: employee.userId.email,
  role: employee.userId.role,
  isActive: employee.userId.isActive,
  phone: employee.phone || employee.userId.phone,
  jobTitle: employee.jobTitle,
  department: employee.department,
  joinedAt: employee.joinedAt,
  createdAt: employee.createdAt,
});

const clientResponse = (customer) => ({
  id: customer._id,
  code: customer.code,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  companyName: customer.companyName,
  address: customer.address,
  city: customer.city,
  state: customer.state,
  pincode: customer.pincode,
  leadStatus: customer.leadStatus,
  createdAt: customer.createdAt,
});

export const listEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find()
      .populate('userId', 'name email role isActive phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, { employees: employees.map(employeeResponse) });
  } catch (error) {
    next(error);
  }
};

export const listClients = async (req, res, next) => {
  try {
    const clients = await Customer.find().sort({ createdAt: -1 });
    return sendSuccess(res, 200, { clients: clients.map(clientResponse) });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  let user;
  try {
    const { name, email, password, role, phone, jobTitle, department } = req.body;
    if (!name?.trim() || !email?.trim() || !password || !role) {
      return next(new ApiError(400, 'Name, email, initial password, and role are required.'));
    }
    if (password.length < 8) {
      return next(new ApiError(400, 'Initial password must be at least 8 characters long.'));
    }
    if (!EMPLOYEE_ROLES.includes(role)) {
      return next(new ApiError(400, 'Select a valid employee role.'));
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.exists({ email: normalizedEmail })) {
      return next(new ApiError(409, 'An account with this email already exists.'));
    }

    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      phone: phone?.trim() || '',
    });

    const employee = await Employee.create({
      userId: user._id,
      phone: phone?.trim() || '',
      jobTitle: jobTitle?.trim() || '',
      department: department?.trim() || role,
    });
    await employee.populate('userId', 'name email role isActive phone');

    return sendSuccess(res, 201, { employee: employeeResponse(employee) }, 'Employee account created.');
  } catch (error) {
    if (user?._id) {
      try {
        await User.deleteOne({ _id: user._id });
      } catch (cleanupError) {
        console.error('Failed to remove employee login after profile creation failed:', cleanupError);
      }
    }
    if (error.code === 11000) {
      return next(new ApiError(409, 'An account with this email or employee profile already exists.'));
    }
    next(error);
  }
};
