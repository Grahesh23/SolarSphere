import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Customer from './models/user-management/Customer.js';
import Project from './models/project-management/Project.js';
import RoofSurvey from './models/project-management/RoofSurvey.js';
import User from './models/user-management/User.js';

try {
  await connectDB();

  const customer = await Customer.findOne({ name: 'Priya Nair' }).lean();
  console.log('CUSTOMER', customer ? { id: String(customer._id), email: customer.email, leadStatus: customer.leadStatus } : 'NOT_FOUND');

  const project = customer ? await Project.findOne({ customerId: customer._id }).lean() : null;
  console.log('PROJECT', project ? { id: String(project._id), code: project.code, surveyId: project.surveyId ? String(project.surveyId) : null, status: project.status } : 'NO_PROJECT');

  const survey = project && project.surveyId ? await RoofSurvey.findById(project.surveyId).lean() : customer ? await RoofSurvey.findOne({ customerId: customer._id }).lean() : null;
  console.log('SURVEY', survey ? { id: String(survey._id), projectId: String(survey.projectId), assignedTo: survey.assignedTo, technicianId: survey.technicianId ? String(survey.technicianId) : null, status: survey.status, scheduledDate: survey.scheduledDate } : 'NO_SURVEY');

  const users = await User.find({ role: { $in: ['Surveyor', 'SURVEY_TECHNICIAN'] } }).select('name email role').lean();
  console.log('SURVEY_USERS', JSON.stringify(users.map((u) => ({ name: u.name, email: u.email, role: u.role, id: String(u._id) })), null, 2));

  await mongoose.disconnect();
} catch (error) {
  console.error(error);
  process.exit(1);
}
