import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/user-management/User.js';
import Customer from '../models/user-management/Customer.js';
import Project from '../models/project-management/Project.js';
import RoofSurvey from '../models/project-management/RoofSurvey.js';

const DEFAULT_PASSWORD = '12345678';

const surveyTechs = [
  { name: 'Survey Tech 01', email: 'surveytech01@solarsphere.com', phone: '+91 90001 0001', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 02', email: 'surveytech02@solarsphere.com', phone: '+91 90001 0002', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 03', email: 'surveytech03@solarsphere.com', phone: '+91 90001 0003', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 04', email: 'surveytech04@solarsphere.com', phone: '+91 90001 0004', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 05', email: 'surveytech05@solarsphere.com', phone: '+91 90001 0005', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 06', email: 'surveytech06@solarsphere.com', phone: '+91 90001 0006', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 07', email: 'surveytech07@solarsphere.com', phone: '+91 90001 0007', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 08', email: 'surveytech08@solarsphere.com', phone: '+91 90001 0008', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 09', email: 'surveytech09@solarsphere.com', phone: '+91 90001 0009', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 10', email: 'surveytech10@solarsphere.com', phone: '+91 90001 0010', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 11', email: 'surveytech11@solarsphere.com', phone: '+91 90001 0011', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 12', email: 'surveytech12@solarsphere.com', phone: '+91 90001 0012', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 13', email: 'surveytech13@solarsphere.com', phone: '+91 90001 0013', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 14', email: 'surveytech14@solarsphere.com', phone: '+91 90001 0014', role: 'SURVEY_TECHNICIAN' },
  { name: 'Survey Tech 15', email: 'surveytech15@solarsphere.com', phone: '+91 90001 0015', role: 'SURVEY_TECHNICIAN' },
];

const installationTechs = [
  { name: 'Install Tech 01', email: 'installtech01@solarsphere.com', phone: '+91 91001 0001', role: 'INSTALLATION_TECHNICIAN' },
  { name: 'Install Tech 02', email: 'installtech02@solarsphere.com', phone: '+91 91001 0002', role: 'INSTALLATION_TECHNICIAN' },
  { name: 'Install Tech 03', email: 'installtech03@solarsphere.com', phone: '+91 91001 0003', role: 'INSTALLATION_TECHNICIAN' },
  { name: 'Install Tech 04', email: 'installtech04@solarsphere.com', phone: '+91 91001 0004', role: 'INSTALLATION_TECHNICIAN' },
  { name: 'Install Tech 05', email: 'installtech05@solarsphere.com', phone: '+91 91001 0005', role: 'INSTALLATION_TECHNICIAN' },
];

const staffUsers = [
  { name: 'Solar Admin', email: 'admin@solarsphere.com', password: DEFAULT_PASSWORD, phone: '+91 91000 0001', role: 'Admin' },
  { name: 'Sales Executive', email: 'sales@solarsphere.com', password: DEFAULT_PASSWORD, phone: '+91 91000 0002', role: 'Sales' },
  { name: 'Warehouse Manager', email: 'warehouse@solarsphere.com', password: DEFAULT_PASSWORD, phone: '+91 91000 0003', role: 'Warehouse' },
  { name: 'Finance Lead', email: 'finance@solarsphere.com', password: DEFAULT_PASSWORD, phone: '+91 91000 0004', role: 'Finance' },
];

const customerSeed = [
  { name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 98100 1001', city: 'Bengaluru', state: 'Karnataka', address: '12 MG Road', desiredCapacity: 4.5, monthlyBill: 4200, electricityConsumption: 390 },
  { name: 'Rahul Verma', email: 'rahul.verma@example.com', phone: '+91 98100 1002', city: 'Pune', state: 'Maharashtra', address: '9 Baner Road', desiredCapacity: 5.2, monthlyBill: 5100, electricityConsumption: 430 },
  { name: 'Meera Iyer', email: 'meera.iyer@example.com', phone: '+91 98100 1003', city: 'Chennai', state: 'Tamil Nadu', address: '18 Anna Nagar', desiredCapacity: 3.8, monthlyBill: 3600, electricityConsumption: 310 },
  { name: 'Arjun Singh', email: 'arjun.singh@example.com', phone: '+91 98100 1004', city: 'Jaipur', state: 'Rajasthan', address: '22 Malviya Nagar', desiredCapacity: 6, monthlyBill: 6200, electricityConsumption: 520 },
  { name: 'Sonia Patel', email: 'sonia.patel@example.com', phone: '+91 98100 1005', city: 'Ahmedabad', state: 'Gujarat', address: '35 Navrangpura', desiredCapacity: 4, monthlyBill: 3800, electricityConsumption: 330 },
  { name: 'Vikram Rao', email: 'vikram.rao@example.com', phone: '+91 98100 1006', city: 'Hyderabad', state: 'Telangana', address: '47 Banjara Hills', desiredCapacity: 5.5, monthlyBill: 5400, electricityConsumption: 470 },
  { name: 'Nisha Kulkarni', email: 'nisha.kulkarni@example.com', phone: '+91 98100 1007', city: 'Nashik', state: 'Maharashtra', address: '13 College Road', desiredCapacity: 3.5, monthlyBill: 3300, electricityConsumption: 285 },
  { name: 'Karan Joshi', email: 'karan.joshi@example.com', phone: '+91 98100 1008', city: 'Vadodara', state: 'Gujarat', address: '88 Alkapuri', desiredCapacity: 7.2, monthlyBill: 7000, electricityConsumption: 610 },
  { name: 'Deepa Menon', email: 'deepa.menon@example.com', phone: '+91 98100 1009', city: 'Kochi', state: 'Kerala', address: '53 Marine Drive', desiredCapacity: 3, monthlyBill: 2800, electricityConsumption: 250 },
  { name: 'Rohit Shah', email: 'rohit.shah@example.com', phone: '+91 98100 1010', city: 'Delhi', state: 'Delhi', address: '17 Dwarka Sector 14', desiredCapacity: 8, monthlyBill: 8200, electricityConsumption: 730 },
  { name: 'Ananya Das', email: 'ananya.das@example.com', phone: '+91 98100 1011', city: 'Kolkata', state: 'West Bengal', address: '8 Salt Lake', desiredCapacity: 4.8, monthlyBill: 4700, electricityConsumption: 400 },
  { name: 'Harish Bhat', email: 'harish.bhat@example.com', phone: '+91 98100 1012', city: 'Mysuru', state: 'Karnataka', address: '20 Bogadi Road', desiredCapacity: 5.8, monthlyBill: 5900, electricityConsumption: 500 },
];

async function ensureUserRecord({ name, email, password, phone, role }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return existing;

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || '',
    role,
    isActive: true,
  });

  return user;
}

async function ensureCustomerRecord(payload) {
  const email = payload.email.toLowerCase();
  const existing = await Customer.findOne({ email });
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  const customer = await Customer.create({
    ...payload,
    email,
    code: `CUST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    leadStatus: 'Survey Scheduled',
    enquirySource: 'Demo seed',
  });

  customer.code = `CUST-${customer._id.toString().slice(-6).toUpperCase()}`;
  await customer.save();
  return customer;
}

async function seedUsers() {
  const all = [...staffUsers, ...surveyTechs, ...installationTechs];
  const created = [];
  for (const item of all) {
    const user = await ensureUserRecord({
      name: item.name,
      email: item.email,
      password: item.password || DEFAULT_PASSWORD,
      phone: item.phone,
      role: item.role,
    });
    created.push(user);
  }
  return created;
}

async function seedCustomersAndProjects() {
  const customers = [];
  const surveyUsers = await User.find({ role: { $in: ['Surveyor', 'SURVEY_TECHNICIAN'] } }).sort({ name: 1 });
  const installUsers = await User.find({ role: { $in: ['Technician', 'INSTALLATION_TECHNICIAN'] } }).sort({ name: 1 });

  for (let i = 0; i < customerSeed.length; i += 1) {
    const customerPayload = customerSeed[i];
    const customer = await ensureCustomerRecord(customerPayload);
    customers.push(customer);

    const projectCode = `PRJ-${String(i + 1).padStart(4, '0')}`;
    const project = await Project.findOne({ code: projectCode });

    if (!project) {
      const newProject = await Project.create({
        code: projectCode,
        customerId: customer._id,
        capacity: customer.desiredCapacity || 5,
        gridType: i % 2 === 0 ? 'On-Grid' : 'Hybrid',
        status: 'Survey Scheduled',
        assignedTo: 'Sales Executive',
        startDate: new Date().toISOString().slice(0, 10),
        completion: 15,
        location: `${customer.city}, ${customer.state}`,
      });

      const surveyTech = surveyUsers[i % surveyUsers.length];
      const survey = await RoofSurvey.findOne({ projectId: newProject._id });
      if (!survey) {
        const createdSurvey = await RoofSurvey.create({
          projectId: newProject._id,
          customerId: customer._id,
          technicianId: surveyTech?._id || null,
          assignedTo: surveyTech?.name || 'Unassigned',
          scheduledDate: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10),
          status: i % 4 === 0 ? 'Approved' : i % 4 === 1 ? 'Submitted' : 'Scheduled',
          roofLength: 18 + i,
          roofWidth: 10 + (i % 5),
          usableArea: 150 + i * 16,
          orientation: ['South', 'East', 'West', 'North'][i % 4],
          tilt: 20 + (i % 5) * 3,
          shading: ['Low', 'Medium', 'High'][i % 3],
          cableDistance: 12 + (i % 6),
          obstacles: i % 2 === 0 ? ['Water tank', 'Tree'] : ['AC unit'],
          remarks: 'Demo survey data for testing.',
        });

        newProject.surveyId = createdSurvey._id;
        await newProject.save();
      }

      if (installUsers.length) {
        const installTech = installUsers[i % installUsers.length];
        customer.leadStatus = 'Survey Scheduled';
        await customer.save();
        console.log(`Assigned survey to ${surveyTech?.name || 'unassigned'} and installation lead to ${installTech?.name || 'unassigned'} for ${newProject.code}`);
      }
    }
  }
}

async function main() {
  await connectDB();
  await seedUsers();
  await seedCustomersAndProjects();
  console.log('✅ Demo seed complete.');
  console.log('Accounts available:');
  console.log(' - admin@solarsphere.com / 12345678');
  console.log(' - sales@solarsphere.com / 12345678');
  console.log(' - warehouse@solarsphere.com / 12345678');
  console.log(' - finance@solarsphere.com / 12345678');
  console.log(' - surveytech01@solarsphere.com ... surveytech15@solarsphere.com / 12345678');
  console.log(' - installtech01@solarsphere.com ... installtech05@solarsphere.com / 12345678');
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
