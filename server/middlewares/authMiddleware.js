import jwt from 'jsonwebtoken';
import User from '../models/user-management/User.js';
import ApiError from '../utils/apiError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'solarsphere-dev-secret';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Authentication required. Please login first.'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ApiError(401, 'User not found for this token.'));
    }
    if (!user.isActive) {
      return next(new ApiError(403, 'This account has been deactivated.'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token.'));
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'Admin') {
    return next(new ApiError(403, 'Administrator access is required.'));
  }
  next();
};
