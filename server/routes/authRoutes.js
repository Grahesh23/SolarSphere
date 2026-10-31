import express from 'express';
import { getMe, loginUser, registerUser } from '../controllers/authController.js';
import { getCustomerPortal } from '../controllers/customerPortalController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/customer-portal', protect, getCustomerPortal);

export default router;
