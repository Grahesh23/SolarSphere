import express from 'express';
import {
  addFollowUp,
  createEnquiry,
  createQuotation,
  decideQuotation,
  getWorkflow,
  reviewSurvey,
  scheduleSurvey,
  submitSurvey,
  updateQuotation,
} from '../controllers/workflowController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getWorkflow);
router.post('/enquiries', createEnquiry);
router.post('/enquiries/:customerId/followups', addFollowUp);
router.post('/enquiries/:customerId/surveys', scheduleSurvey);
router.patch('/surveys/:surveyId', submitSurvey);
router.patch('/surveys/:surveyId/review', requireAdmin, reviewSurvey[1]);
router.post('/projects/:projectId/quotations', createQuotation);
router.patch('/quotations/:quotationId', updateQuotation);
router.patch('/quotations/:quotationId/decision', decideQuotation);

export default router;
