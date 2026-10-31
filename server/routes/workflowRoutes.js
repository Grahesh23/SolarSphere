import express from 'express';
import {
  addFollowUp,
  assignSurvey,
  createEnquiry,
  createProject,
  createQuotation,
  decideQuotation,
  getSurveyors,
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
router.get('/surveyors', getSurveyors[1]);
router.post('/projects', createProject);
router.post('/enquiries', createEnquiry);
router.post('/enquiries/:customerId/followups', addFollowUp);
router.post('/enquiries/:customerId/surveys', scheduleSurvey);
router.post('/projects/:projectId/surveys', assignSurvey[1]);
router.patch('/surveys/:surveyId', submitSurvey);
router.patch('/surveys/:surveyId/review', reviewSurvey[0], reviewSurvey[1]);
router.post('/projects/:projectId/quotations', createQuotation);
router.patch('/quotations/:quotationId', updateQuotation);
router.patch('/quotations/:quotationId/decision', decideQuotation);

export default router;
