import User from '../models/user-management/User.js';
import ApiError from '../utils/apiError.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ensureCustomerProfile } from './customerPortalController.js';

export const roleMatchesRequestedRole = (accountRole, requestedRole) => {
  if (!requestedRole) return true;
  const normalizedAccountRole = String(accountRole || '').trim();
  const normalizedRequestedRole = String(requestedRole || '').trim();

  const roleAliases = {
    Surveyor: ['Surveyor', 'SURVEY_TECHNICIAN'],
    'SURVEY_TECHNICIAN': ['Surveyor', 'SURVEY_TECHNICIAN'],
    Technician: ['Technician', 'INSTALLATION_TECHNICIAN'],
    'INSTALLATION_TECHNICIAN': ['Technician', 'INSTALLATION_TECHNICIAN'],
    Admin: ['Admin'],
    Sales: ['Sales'],
    Warehouse: ['Warehouse'],
    Service: ['Service'],
    Finance: ['Finance'],
    Client: ['Client', 'Customer'],
    Customer: ['Client', 'Customer'],
  };

  const allowedRoles = roleAliases[normalizedRequestedRole] || [normalizedRequestedRole];
  return allowedRoles.includes(normalizedAccountRole);
};

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  companyName: user.companyName,
  customerId: user.customerId,
  isActive: user.isActive,
});

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, companyName } = req.body;

    if (!name || !email || !password) {
      return next(new ApiError(400, 'Name, email and password are required.'));
    }

    if (password.length < 6) {
      return next(new ApiError(400, 'Password must be at least 6 characters long.'));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new ApiError(409, 'An account with this email already exists.'));
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone || '',
      companyName: companyName || '',
      role: 'Customer',
    });

    try {
      const customer = await ensureCustomerProfile(user);
      user.customerId = customer._id;
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }

    const token = generateToken(user);

    return sendSuccess(
      res,
      201,
      {
        user: safeUser(user),
        token,
      },
      'Client account created successfully.'
    );
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Email and password are required.'));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return next(new ApiError(401, 'No account found with that email address.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Incorrect password.'));
    }

    if (role && !roleMatchesRequestedRole(user.role, role)) {
      return next(new ApiError(403, `This account is registered as ${user.role}, not ${role}.`));
    }

    const token = generateToken(user);

    return sendSuccess(
      res,
      200,
      {
        user: safeUser(user),
        token,
      },
      'Login successful.'
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  return sendSuccess(res, 200, { user: safeUser(req.user) }, 'Profile retrieved successfully.');
};
