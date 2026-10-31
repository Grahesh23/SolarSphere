import express from 'express';
import { createEmployee, listClients, listEmployees } from '../controllers/adminUserController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/employees', listEmployees);
router.post('/employees', createEmployee);
router.get('/clients', listClients);

export default router;
