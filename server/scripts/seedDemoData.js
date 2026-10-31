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
  { name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 98100 1001', companyName: 'Nair Homes', city: 'Bengaluru', state: 'Karnataka', address: '12 MG Road', desiredCapacity: 4.5, monthlyBill: 4200, electricityConsumption: 390 },
  { name: 'Rahul Verma', email: 'rahul.verma@example.com', phone: '+91 98100 1002', companyName: 'Verma Studio', city: 'Pune', state: 'Maharashtra', address: '9 Baner Road', desiredCapacity: 5.2, monthlyBill: 5100, electricityConsumption: 430 },
  { name: 'Meera Iyer', email: 'meera.iyer@example.com', phone: '+91 98100 1003', companyName: 'Iyer Logistics', city: 'Chennai', state: 'Tamil Nadu', address: '18 Anna Nagar', desiredCapacity: 3.8, monthlyBill: 3600, electricityConsumption: 310 },
  { name: 'Arjun Singh', email: 'arjun.singh@example.com', phone: '+91 98100 1004', companyName: 'Singh Infra', city: 'Jaipur', state: 'Rajasthan', address: '22 Malviya Nagar', desiredCapacity: 6, monthlyBill: 6200, electricityConsumption: 520 },
  { name: 'Sonia Patel', email: 'sonia.patel@example.com', phone: '+91 98100 1005', companyName: 'Patel Retail', city: 'Ahmedabad', state: 'Gujarat', address: '35 Navrangpura', desiredCapacity: 4, monthlyBill: 3800, electricityConsumption: 330 },
  { name: 'Vikram Rao', email: 'vikram.rao@example.com', phone: '+91 98100 1006', companyName: 'Rao Ventures', city: 'Hyderabad', state: 'Telangana', address: '47 Banjara Hills', desiredCapacity: 5.5, monthlyBill: 5400, electricityConsumption: 470 },
  { name: 'Nisha Kulkarni', email: 'nisha.kulkarni@example.com', phone: '+91 98100 1007', companyName: 'Kulkarni Farm', city: 'Nashik', state: 'Maharashtra', address: '13 College Road', desiredCapacity: 3.5, monthlyBill: 3300, electricityConsumption: 285 },
  { name: 'Karan Joshi', email: 'karan.joshi@example.com', phone: '+91 98100 1008', companyName: 'Joshi Foods', city: 'Vadodara', state: 'Gujarat', address: '88 Alkapuri', desiredCapacity: 7.2, monthlyBill: 7000, electricityConsumption: 610 },
  { name: 'Deepa Menon', email: 'deepa.menon@example.com', phone: '+91 98100 1009', companyName: 'Menon Design', city: 'Kochi', state: 'Kerala', address: '53 Marine Drive', desiredCapacity: 3, monthlyBill: 2800, electricityConsumption: 250 },
  { name: 'Rohit Shah', email: 'rohit.shah@example.com', phone: '+91 98100 1010', companyName: 'Shah Tech', city: 'Delhi', state: 'Delhi', address: '17 Dwarka Sector 14', desiredCapacity: 8, monthlyBill: 8200, electricityConsumption: 730 },
  { name: 'Ananya Das', email: 'ananya.das@example.com', phone: '+91 98100 1011', companyName: 'Das Energy', city: 'Kolkata', state: 'West Bengal', address: '8 Salt Lake', desiredCapacity: 4.8, monthlyBill: 4700, electricityConsumption: 400 },
  { name: 'Harish Bhat', email: 'harish.bhat@example.com', phone: '+91 98100 1012', companyName: 'Bhat Services', city: 'Mysuru', state: 'Karnataka', address: '20 Bogadi Road', desiredCapacity: 5.8, monthlyBill: 5900, electricityConsumption: 500 },
  { name: 'Aditi Sharma', email: 'aditi.sharma@example.com', phone: '+91 98100 1013', companyName: 'Sharma Comfort', city: 'Lucknow', state: 'Uttar Pradesh', address: '44 Gomti Nagar', desiredCapacity: 6.4, monthlyBill: 6400, electricityConsumption: 540 },
  { name: 'Rakesh Malhotra', email: 'rakesh.malhotra@example.com', phone: '+91 98100 1014', companyName: 'Malhotra Motors', city: 'Noida', state: 'Uttar Pradesh', address: '72 Sector 62', desiredCapacity: 5.1, monthlyBill: 5000, electricityConsumption: 420 },
  { name: 'Simran Kaur', email: 'simran.kaur@example.com', phone: '+91 98100 1015', companyName: 'Kaur Textiles', city: 'Amritsar', state: 'Punjab', address: '11 Ranjit Avenue', desiredCapacity: 4.3, monthlyBill: 4100, electricityConsumption: 350 },
  { name: 'Nitin Chawla', email: 'nitin.chawla@example.com', phone: '+91 98100 1016', companyName: 'Chawla Enterprises', city: 'Faridabad', state: 'Haryana', address: '19 Sector 21', desiredCapacity: 7.5, monthlyBill: 7600, electricityConsumption: 650 },
  { name: 'Ishita Banerjee', email: 'ishita.banerjee@example.com', phone: '+91 98100 1017', companyName: 'Banerjee Homes', city: 'Durgapur', state: 'West Bengal', address: '7 City Centre', desiredCapacity: 3.9, monthlyBill: 3700, electricityConsumption: 320 },
  { name: 'Siddharth Gupta', email: 'siddharth.gupta@example.com', phone: '+91 98100 1018', companyName: 'Gupta Traders', city: 'Gurugram', state: 'Haryana', address: '31 Cyber Hub', desiredCapacity: 6.8, monthlyBill: 6900, electricityConsumption: 590 },
  { name: 'Pooja Reddy', email: 'pooja.reddy@example.com', phone: '+91 98100 1019', companyName: 'Reddy Constructions', city: 'Vijayawada', state: 'Andhra Pradesh', address: '55 Governorpet', desiredCapacity: 4.7, monthlyBill: 4500, electricityConsumption: 390 },
  { name: 'Aman Khan', email: 'aman.khan@example.com', phone: '+91 98100 1020', companyName: 'Khan Hospitality', city: 'Bhopal', state: 'Madhya Pradesh', address: '18 Arera Colony', desiredCapacity: 5.6, monthlyBill: 5600, electricityConsumption: 475 },
  { name: 'Divya Sen', email: 'divya.sen@example.com', phone: '+91 98100 1021', companyName: 'Sen Dental', city: 'Agra', state: 'Uttar Pradesh', address: '27 Taj Ganj', desiredCapacity: 3.6, monthlyBill: 3400, electricityConsumption: 290 },
  { name: 'Vivek Pillai', email: 'vivek.pillai@example.com', phone: '+91 98100 1022', companyName: 'Pillai Motors', city: 'Thiruvananthapuram', state: 'Kerala', address: '62 Kowdiar', desiredCapacity: 5.9, monthlyBill: 6000, electricityConsumption: 500 },
  { name: 'Kavya Nair', email: 'kavya.nair@example.com', phone: '+91 98100 1023', companyName: 'Nair Wellness', city: 'Coimbatore', state: 'Tamil Nadu', address: '33 RS Puram', desiredCapacity: 4.1, monthlyBill: 3900, electricityConsumption: 335 },
  { name: 'Tushar Dutta', email: 'tushar.dutta@example.com', phone: '+91 98100 1024', companyName: 'Dutta Foods', city: 'Patna', state: 'Bihar', address: '9 Boring Road', desiredCapacity: 6.1, monthlyBill: 6100, electricityConsumption: 520 },
  { name: 'Mansi Joshi', email: 'mansi.joshi@example.com', phone: '+91 98100 1025', companyName: 'Joshi Boutique', city: 'Nagpur', state: 'Maharashtra', address: '14 Sadar', desiredCapacity: 4.9, monthlyBill: 4800, electricityConsumption: 410 },
];

async function ensureUserRecord({ name, email, password, phone, role }) {
  const searchEmail = email.toLowerCase();
  let existing = await User.findOne({ email: searchEmail });

  if (existing) {
    if (!existing.password || existing.password === '') {
      existing.password = password || DEFAULT_PASSWORD;
      await existing.save();
    }
    return existing;
  }

  const user = await User.create({
    name,
    email: searchEmail,
    password: password || DEFAULT_PASSWORD,
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

async function ensureCustomerLoginAccount(customer) {
  const email = customer.email.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: customer.name,
      email,
      password: DEFAULT_PASSWORD,
      phone: customer.phone || '',
      companyName: customer.companyName || '',
      role: 'Customer',
      isActive: true,
    });
  } else {
    if (!user.password || user.password === '') {
      user.password = DEFAULT_PASSWORD;
    }
    if (user.role !== 'Customer') {
      user.role = 'Customer';
    }
    await user.save();
  }

  if (!user.customerId || user.customerId.toString() !== customer._id.toString()) {
    user.customerId = customer._id;
    await user.save();
  }

  if (!customer.userId || customer.userId.toString() !== user._id.toString()) {
    customer.userId = user._id;
    await customer.save();
  }

  return user;
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
    await ensureCustomerLoginAccount(customer);
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
  console.log(' - seeded client customers (25) / 12345678');
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
