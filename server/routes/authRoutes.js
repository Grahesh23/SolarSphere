import express from 'express';
import { getMe, loginUser, registerUser } from '../controllers/authController.js';
import { getCustomerPortal, submitCustomerEnquiry } from '../controllers/customerPortalController.js';
import { decideQuotation } from '../controllers/workflowController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/customer-portal', protect, getCustomerPortal);
router.post('/customer-enquiries', protect, submitCustomerEnquiry);
router.patch('/quotations/:quotationId/decision', protect, decideQuotation);

export default router;
