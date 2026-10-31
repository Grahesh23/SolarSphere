// DataState interface removed (TypeScript only)
// All type imports removed (TypeScript only)

const today = new Date('2026-10-31');
const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => iso(new Date(today.getTime() - n * 86400000));
const daysAhead = (n) => iso(new Date(today.getTime() + n * 86400000));

export const SEED_DATA = {
  customers: [
    {
      id: 'cus-1', code: 'CUST-001', name: 'Rajesh Sharma', email: 'rajesh.sharma@email.com',
      phone: '+91 98765 43210', address: '12 Green Park Avenue', city: 'Pune', state: 'Maharashtra', pincode: '411001',
      electricityConsumption: 480, monthlyBill: 7200, desiredCapacity: 5, enquirySource: 'Website',
      assignedTo: 'Meera Nair', leadStatus: 'Won', createdAt: daysAgo(120),
      interactions: [
        { id: 'i1', date: daysAgo(118), type: 'Call', note: 'Initial enquiry for rooftop solar, 5kW requirement', by: 'Meera Nair' },
        { id: 'i2', date: daysAgo(110), type: 'Email', note: 'Sent brochure and subsidy information', by: 'Meera Nair' },
        { id: 'i3', date: daysAgo(95), type: 'Visit', note: 'Site survey completed, roof suitable', by: 'Arjun Verma' },
      ],
    },
    {
      id: 'cus-2', code: 'CUST-002', name: 'Priya Patel', email: 'priya.patel@email.com',
      phone: '+91 98200 11223', address: '45 Lotus Residency', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015',
      electricityConsumption: 320, monthlyBill: 4800, desiredCapacity: 3, enquirySource: 'Referral',
      assignedTo: 'Meera Nair', leadStatus: 'Won', createdAt: daysAgo(80),
      interactions: [
        { id: 'i4', date: daysAgo(78), type: 'Call', note: 'Referred by CUST-001, interested in 3kW', by: 'Meera Nair' },
        { id: 'i5', date: daysAgo(65), type: 'Visit', note: 'Survey scheduled, north-facing roof', by: 'Arjun Verma' },
      ],
    },
    {
      id: 'cus-3', code: 'CUST-003', name: 'Vikram Reddy', email: 'vikram.reddy@email.com',
      phone: '+91 90080 44556', address: '78 Hill View', city: 'Hyderabad', state: 'Telangana', pincode: '500032',
      electricityConsumption: 240, monthlyBill: 3600, desiredCapacity: 2, enquirySource: 'Advertisement',
      assignedTo: 'Karthik Iyer', leadStatus: 'Quoted', createdAt: daysAgo(35),
      interactions: [
        { id: 'i6', date: daysAgo(30), type: 'Call', note: 'Looking for 2kW off-grid solution for farmhouse', by: 'Karthik Iyer' },
      ],
    },
    {
      id: 'cus-4', code: 'CUST-004', name: 'Anita Desai', email: 'anita.desai@email.com',
      phone: '+91 97000 77889', address: '23 Sea Breeze', city: 'Mumbai', state: 'Maharashtra', pincode: '400050',
      electricityConsumption: 650, monthlyBill: 9800, desiredCapacity: 5, enquirySource: 'Exhibition',
      assignedTo: 'Karthik Iyer', leadStatus: 'Survey Scheduled', createdAt: daysAgo(18),
      interactions: [
        { id: 'i7', date: daysAgo(15), type: 'Call', note: 'Met at expo, high consumption, needs 5kW', by: 'Karthik Iyer' },
      ],
    },
    {
      id: 'cus-5', code: 'CUST-005', name: 'Sunil Krishnan', email: 'sunil.k@email.com',
      phone: '+91 94400 22110', address: '90 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001',
      electricityConsumption: 400, monthlyBill: 6000, desiredCapacity: 4, enquirySource: 'Website',
      assignedTo: 'Meera Nair', leadStatus: 'Contacted', createdAt: daysAgo(10),
      interactions: [
        { id: 'i8', date: daysAgo(8), type: 'Email', note: 'Requested quote for 4kW on-grid', by: 'Meera Nair' },
      ],
    },
    {
      id: 'cus-6', code: 'CUST-006', name: 'Deepa Iyer', email: 'deepa.iyer@email.com',
      phone: '+91 96330 55442', address: '15 Garden Layout', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020',
      electricityConsumption: 290, monthlyBill: 4300, desiredCapacity: 3, enquirySource: 'Referral',
      assignedTo: 'Karthik Iyer', leadStatus: 'New', createdAt: daysAgo(4),
      interactions: [],
    },
  ],

  projects: [
    {
      id: 'prj-1', code: 'PRJ-2026-001', customerId: 'cus-1', capacity: 5, gridType: 'On-Grid',
      status: 'Completed', assignedEmployees: ['Arjun Verma', 'Suresh Kumar'], startDate: daysAgo(110),
      targetEndDate: daysAgo(70), completion: 100, surveyId: 'srv-1', quotationId: 'quo-1', configId: 'cfg-1',
      warrantyIds: ['war-1', 'war-2', 'war-3'], totalCost: 285000, advancePaid: 285000, location: 'Pune, MH',
    },
    {
      id: 'prj-2', code: 'PRJ-2026-002', customerId: 'cus-2', capacity: 3, gridType: 'On-Grid',
      status: 'In Progress', assignedEmployees: ['Arjun Verma', 'Ramesh Yadav'], startDate: daysAgo(60),
      targetEndDate: daysAhead(5), completion: 75, surveyId: 'srv-2', quotationId: 'quo-2', configId: 'cfg-2',
      warrantyIds: [], totalCost: 175000, advancePaid: 140000, location: 'Ahmedabad, GJ',
    },
    {
      id: 'prj-3', code: 'PRJ-2026-003', customerId: 'cus-3', capacity: 2, gridType: 'Off-Grid',
      status: 'Quotation Sent', assignedEmployees: ['Karthik Iyer'], startDate: daysAgo(20),
      targetEndDate: daysAhead(40), completion: 30, surveyId: 'srv-3', quotationId: 'quo-3',
      warrantyIds: [], totalCost: 120000, advancePaid: 0, location: 'Hyderabad, TS',
    },
    {
      id: 'prj-4', code: 'PRJ-2026-004', customerId: 'cus-4', capacity: 5, gridType: 'Hybrid',
      status: 'Survey Scheduled', assignedEmployees: ['Arjun Verma'], startDate: daysAgo(5),
      targetEndDate: daysAhead(55), completion: 10, surveyId: 'srv-4',
      warrantyIds: [], totalCost: 320000, advancePaid: 0, location: 'Mumbai, MH',
    },
    {
      id: 'prj-5', code: 'PRJ-2026-005', customerId: 'cus-5', capacity: 4, gridType: 'On-Grid',
      status: 'Enquiry', assignedEmployees: ['Meera Nair'], startDate: daysAgo(8),
      targetEndDate: daysAhead(60), completion: 5,
      warrantyIds: [], totalCost: 220000, advancePaid: 0, location: 'Bengaluru, KA',
    },
  ],

  surveys: [
    {
      id: 'srv-1', projectId: 'prj-1', customerId: 'cus-1', technicianId: 'tech-1', scheduledDate: daysAgo(100),
      status: 'Approved', roofLength: 12, roofWidth: 8, usableArea: 88, orientation: 'South', tilt: 22,
      shading: 'Low', obstacles: ['Water tank (corner)'], cableDistance: 14,
      photos: ['roof-1a.jpg', 'roof-1b.jpg'], remarks: 'Excellent south-facing roof, minimal shading', approvedAt: daysAgo(96), approvedBy: 'Meera Nair',
    },
    {
      id: 'srv-2', projectId: 'prj-2', customerId: 'cus-2', technicianId: 'tech-1', scheduledDate: daysAgo(58),
      status: 'Approved', roofLength: 9, roofWidth: 6, usableArea: 48, orientation: 'North', tilt: 18,
      shading: 'None', obstacles: [], cableDistance: 9,
      photos: ['roof-2a.jpg'], remarks: 'Clean north roof, ideal for 3kW', approvedAt: daysAgo(55), approvedBy: 'Meera Nair',
    },
    {
      id: 'srv-3', projectId: 'prj-3', customerId: 'cus-3', technicianId: 'tech-2', scheduledDate: daysAgo(18),
      status: 'Approved', roofLength: 7, roofWidth: 5, usableArea: 30, orientation: 'East', tilt: 15,
      shading: 'Moderate', obstacles: ['Adjacent building shadow (morning)'], cableDistance: 18,
      photos: ['roof-3a.jpg', 'roof-3b.jpg'], remarks: 'Off-grid farmhouse, morning shade from neighbor building', approvedAt: daysAgo(15), approvedBy: 'Karthik Iyer',
    },
    {
      id: 'srv-4', projectId: 'prj-4', customerId: 'cus-4', technicianId: 'tech-3', scheduledDate: daysAhead(2),
      status: 'Scheduled', roofLength: 0, roofWidth: 0, usableArea: 0, orientation: '', tilt: 0,
      shading: 'None', obstacles: [], cableDistance: 0, photos: [], remarks: '',
    },
  ],

  configs: [
    {
      id: 'cfg-1', projectId: 'prj-1', recommendedCapacity: 5, gridType: 'On-Grid', panelCount: 10,
      panelModel: 'Waaree 540W Mono PERC', inverterModel: 'SolarEdge 5kW Single Phase', batteryCount: 0,
      batteryModel: '', estimatedCost: 285000, estimatedAnnual: 8200, paybackYears: 4.6, status: 'Approved', createdAt: daysAgo(92),
    },
    {
      id: 'cfg-2', projectId: 'prj-2', recommendedCapacity: 3, gridType: 'On-Grid', panelCount: 6,
      panelModel: 'Tata Power 540W', inverterModel: 'Enphase IQ8+ Micro', batteryCount: 0,
      batteryModel: '', estimatedCost: 175000, estimatedAnnual: 4950, paybackYears: 4.9, status: 'Approved', createdAt: daysAgo(50),
    },
    {
      id: 'cfg-3', projectId: 'prj-3', recommendedCapacity: 2, gridType: 'Off-Grid', panelCount: 4,
      panelModel: 'Vikram 540W', inverterModel: 'Luminous 3kVA Off-Grid', batteryCount: 2,
      batteryModel: 'Exide 150Ah Tubular', estimatedCost: 120000, estimatedAnnual: 3100, paybackYears: 6.1, status: 'Recommended', createdAt: daysAgo(12),
    },
  ],

  quotations: [
    {
      id: 'quo-1', code: 'QTN-2026-001', projectId: 'prj-1', customerId: 'cus-1', status: 'Accepted',
      items: [
        { id: 'qi1', component: 'Solar Panel 540W', category: 'Panel', qty: 10, unitPrice: 16500 },
        { id: 'qi2', component: '5kW String Inverter', category: 'Inverter', qty: 1, unitPrice: 65000 },
        { id: 'qi3', component: 'Mounting Structure Kit', category: 'Mounting', qty: 1, unitPrice: 28000 },
        { id: 'qi4', component: 'DC & AC Cabling', category: 'Cable', qty: 1, unitPrice: 14000 },
        { id: 'qi5', component: 'Installation & Commissioning', category: 'Accessory', qty: 1, unitPrice: 22000 },
      ],
      subtotal: 265000, tax: 20000, total: 285000, createdAt: daysAgo(90), validUntil: daysAgo(60), bomApproved: true,
    },
    {
      id: 'quo-2', code: 'QTN-2026-002', projectId: 'prj-2', customerId: 'cus-2', status: 'Accepted',
      items: [
        { id: 'qi6', component: 'Solar Panel 540W', category: 'Panel', qty: 6, unitPrice: 16000 },
        { id: 'qi7', component: 'Microinverter', category: 'Inverter', qty: 6, unitPrice: 8500 },
        { id: 'qi8', component: 'Mounting Structure Kit', category: 'Mounting', qty: 1, unitPrice: 18000 },
        { id: 'qi9', component: 'DC & AC Cabling', category: 'Cable', qty: 1, unitPrice: 9000 },
      ],
      subtotal: 161000, tax: 14000, total: 175000, createdAt: daysAgo(48), validUntil: daysAgo(18), bomApproved: true,
    },
    {
      id: 'quo-3', code: 'QTN-2026-003', projectId: 'prj-3', customerId: 'cus-3', status: 'Sent',
      items: [
        { id: 'qi10', component: 'Solar Panel 540W', category: 'Panel', qty: 4, unitPrice: 16000 },
        { id: 'qi11', component: '3kVA Off-Grid Inverter', category: 'Inverter', qty: 1, unitPrice: 32000 },
        { id: 'qi12', component: '150Ah Tubular Battery', category: 'Battery', qty: 2, unitPrice: 14500 },
        { id: 'qi13', component: 'Mounting Structure Kit', category: 'Mounting', qty: 1, unitPrice: 12000 },
        { id: 'qi14', component: 'Charge Controller 40A', category: 'Charge Controller', qty: 1, unitPrice: 8500 },
      ],
      subtotal: 111000, tax: 9000, total: 120000, createdAt: daysAgo(10), validUntil: daysAhead(20), bomApproved: false,
    },
  ],

  inventory: [
    { id: 'inv-1', sku: 'PAN-540W-M', name: 'Solar Panel 540W Mono PERC', category: 'Panel', brand: 'Waaree', unit: 'pcs', stock: 48, reorderLevel: 20, unitPrice: 16000, supplierId: 'sup-1', specs: { wattage: '540W', type: 'Mono PERC', efficiency: '21%' } },
    { id: 'inv-2', sku: 'PAN-540W-T', name: 'Solar Panel 540W', category: 'Panel', brand: 'Tata Power', unit: 'pcs', stock: 14, reorderLevel: 15, unitPrice: 16200, supplierId: 'sup-2', specs: { wattage: '540W', type: 'Mono', efficiency: '20.5%' } },
    { id: 'inv-3', sku: 'INV-5K-SE', name: '5kW String Inverter', category: 'Inverter', brand: 'SolarEdge', unit: 'pcs', stock: 6, reorderLevel: 4, unitPrice: 62000, supplierId: 'sup-3', specs: { power: '5kW', phase: 'Single', mppt: '2' } },
    { id: 'inv-4', sku: 'INV-3K-OG', name: '3kVA Off-Grid Inverter', category: 'Inverter', brand: 'Luminous', unit: 'pcs', stock: 3, reorderLevel: 3, unitPrice: 30000, supplierId: 'sup-4', specs: { power: '3kVA', type: 'Off-Grid' } },
    { id: 'inv-5', sku: 'BAT-150T', name: '150Ah Tubular Battery', category: 'Battery', brand: 'Exide', unit: 'pcs', stock: 22, reorderLevel: 10, unitPrice: 14000, supplierId: 'sup-5', specs: { capacity: '150Ah', type: 'Tubular' } },
    { id: 'inv-6', sku: 'BAT-200L', name: '200Ah Lithium Battery', category: 'Battery', brand: 'Loom Solar', unit: 'pcs', stock: 4, reorderLevel: 5, unitPrice: 38000, supplierId: 'sup-5', specs: { capacity: '200Ah', type: 'Lithium' } },
    { id: 'inv-7', sku: 'CC-40A', name: 'Charge Controller 40A', category: 'Charge Controller', brand: 'Phocos', unit: 'pcs', stock: 11, reorderLevel: 5, unitPrice: 8000, supplierId: 'sup-4', specs: { current: '40A', type: 'MPPT' } },
    { id: 'inv-8', sku: 'MNT-KIT', name: 'Mounting Structure Kit', category: 'Mounting', brand: 'Gautam Solar', unit: 'set', stock: 18, reorderLevel: 8, unitPrice: 16000, supplierId: 'sup-6', specs: { material: 'Aluminium', coating: 'Anodized' } },
    { id: 'inv-9', sku: 'CBL-DC4', name: 'DC Cable 4mm²', category: 'Cable', brand: 'Polycab', unit: 'm', stock: 320, reorderLevel: 100, unitPrice: 65, supplierId: 'sup-7', specs: { size: '4mm²', rating: '1500V DC' } },
    { id: 'inv-10', sku: 'CBL-AC6', name: 'AC Cable 6mm²', category: 'Cable', brand: 'Polycab', unit: 'm', stock: 180, reorderLevel: 80, unitPrice: 90, supplierId: 'sup-7', specs: { size: '6mm²', rating: '1100V AC' } },
    { id: 'inv-11', sku: 'ACC-MCN', name: 'MC4 Connectors (pair)', category: 'Accessory', brand: 'Amphenol', unit: 'pair', stock: 240, reorderLevel: 50, unitPrice: 120, supplierId: 'sup-4', specs: { type: 'MC4', current: '30A' } },
    { id: 'inv-12', sku: 'ACC-ERD', name: 'Earthing Kit', category: 'Accessory', brand: 'APC', unit: 'set', stock: 9, reorderLevel: 6, unitPrice: 4500, supplierId: 'sup-4', specs: { type: 'Chemical', resistance: '<5Ω' } },
  ],

  equipment: [
    { id: 'eq-1', serialNumber: 'WA-PAN-001', itemId: 'inv-1', projectId: 'prj-1', customerId: 'cus-1', status: 'Installed', warrantyStatus: 'Active', deliveredAt: daysAgo(72), warrantyStart: daysAgo(70), warrantyEnd: daysAhead(1090), qrToken: 'WA-PAN-001-PRJ1', repairHistory: [] },
    { id: 'eq-2', serialNumber: 'WA-INV-001', itemId: 'inv-3', projectId: 'prj-1', customerId: 'cus-1', status: 'Installed', warrantyStatus: 'Active', deliveredAt: daysAgo(72), warrantyStart: daysAgo(70), warrantyEnd: daysAhead(1820), qrToken: 'WA-INV-001-PRJ1', repairHistory: [] },
    { id: 'eq-3', serialNumber: 'WA-CC-001', itemId: 'inv-7', projectId: 'prj-1', customerId: 'cus-1', status: 'Installed', warrantyStatus: 'Active', deliveredAt: daysAgo(72), warrantyStart: daysAgo(70), warrantyEnd: daysAhead(1090), qrToken: 'WA-CC-001-PRJ1', repairHistory: [] },
    { id: 'eq-4', serialNumber: 'TP-PAN-101', itemId: 'inv-2', projectId: 'prj-2', customerId: 'cus-2', status: 'Dispatched', warrantyStatus: 'Pending', deliveredAt: daysAgo(8), qrToken: 'TP-PAN-101-PRJ2', repairHistory: [] },
    { id: 'eq-5', serialNumber: 'LM-BAT-201', itemId: 'inv-6', status: 'In Stock', warrantyStatus: 'Pending', qrToken: 'LM-BAT-201', repairHistory: [] },
  ],

  dispatches: [
    {
      id: 'dsp-1', code: 'DSP-001', projectId: 'prj-1', equipmentIds: ['eq-1', 'eq-2', 'eq-3'],
      technicianId: 'tech-1', status: 'Delivered', createdAt: daysAgo(75), shippedAt: daysAgo(74), deliveredAt: daysAgo(72),
      checklist: [
        { label: 'Panels verified against BOM', done: true },
        { label: 'Inverter serial recorded', done: true },
        { label: 'Mounting kit packed', done: true },
        { label: 'Cables packed', done: true },
        { label: 'Earthing kit included', done: true },
      ],
    },
    {
      id: 'dsp-2', code: 'DSP-002', projectId: 'prj-2', equipmentIds: ['eq-4'],
      technicianId: 'tech-2', status: 'Shipped', createdAt: daysAgo(9), shippedAt: daysAgo(8),
      checklist: [
        { label: 'Panels verified against BOM', done: true },
        { label: 'Microinverters packed', done: true },
        { label: 'Mounting kit packed', done: true },
        { label: 'Cables packed', done: false },
        { label: 'Earthing kit included', done: false },
      ],
    },
  ],

  technicians: [
    { id: 'tech-1', name: 'Arjun Verma', phone: '+91 98000 11111', email: 'arjun@solarsphere.io', skills: ['Rooftop Survey', 'On-Grid Install', 'Off-Grid Install'], availability: 'On Job', rating: 4.8, completedJobs: 42, activeJobs: 1, assignedProjectIds: ['prj-2'] },
    { id: 'tech-2', name: 'Ramesh Yadav', phone: '+91 98000 22222', email: 'ramesh@solarsphere.io', skills: ['Mounting', 'Wiring', 'Earthing'], availability: 'On Job', rating: 4.6, completedJobs: 28, activeJobs: 1, assignedProjectIds: ['prj-2'] },
    { id: 'tech-3', name: 'Suresh Kumar', phone: '+91 98000 33333', email: 'suresh@solarsphere.io', skills: ['Off-Grid Install', 'Battery Systems'], availability: 'Available', rating: 4.9, completedJobs: 36, activeJobs: 0, assignedProjectIds: [] },
    { id: 'tech-4', name: 'Karthik Iyer', phone: '+91 98000 44444', email: 'karthik@solarsphere.io', skills: ['Survey', 'Hybrid Systems', 'Testing'], availability: 'Off Duty', rating: 4.7, completedJobs: 19, activeJobs: 0, assignedProjectIds: [] },
  ],

  installations: [
    {
      id: 'ins-1', projectId: 'prj-1', technicianId: 'tech-1', scheduledDate: daysAgo(70),
      status: 'Accepted', startedAt: daysAgo(70), finishedAt: daysAgo(68), photos: ['inst-1a.jpg', 'inst-1b.jpg'],
      checklist: [
        { label: 'Panel mounting complete', done: true },
        { label: 'DC wiring complete', done: true },
        { label: 'Inverter commissioned', done: true },
        { label: 'Earthing verified', done: true },
        { label: 'Grid sync test', done: true },
      ],
      earthingConfirmed: true, customerAccepted: true, acceptedAt: daysAgo(67), acceptedByName: 'Rajesh Sharma',
    },
    {
      id: 'ins-2', projectId: 'prj-2', technicianId: 'tech-2', scheduledDate: daysAhead(2),
      status: 'Scheduled', photos: [],
      checklist: [
        { label: 'Panel mounting complete', done: false },
        { label: 'DC wiring complete', done: false },
        { label: 'Inverter commissioned', done: false },
        { label: 'Earthing verified', done: false },
        { label: 'Grid sync test', done: false },
      ],
      earthingConfirmed: false, customerAccepted: false,
    },
  ],

  warranties: [
    { id: 'war-1', equipmentId: 'eq-1', projectId: 'prj-1', customerId: 'cus-1', status: 'Active', startDate: daysAgo(70), endDate: daysAhead(1090), terms: '25 year linear performance warranty on panel', claims: [] },
    { id: 'war-2', equipmentId: 'eq-2', projectId: 'prj-1', customerId: 'cus-1', status: 'Active', startDate: daysAgo(70), endDate: daysAhead(1820), terms: '5 year inverter replacement warranty', claims: [] },
    { id: 'war-3', equipmentId: 'eq-3', projectId: 'prj-1', customerId: 'cus-1', status: 'Active', startDate: daysAgo(70), endDate: daysAhead(1090), terms: '3 year charge controller warranty', claims: [] },
  ],

  services: [
    {
      id: 'svc-1', code: 'TKT-001', customerId: 'cus-1', projectId: 'prj-1', equipmentId: 'eq-2',
      type: 'Warranty', subject: 'Inverter showing intermittent fault code', description: 'SolarEdge 5kW inverter displays error code 3x every 2-3 days, resets on its own.',
      status: 'Assigned', assignedTo: 'Suresh Kumar', createdAt: daysAgo(6), partsCost: 0, labourCost: 0, customerConfirmed: false,
    },
    {
      id: 'svc-2', code: 'TKT-002', customerId: 'cus-2', type: 'Maintenance', subject: 'Annual maintenance check',
      description: 'Customer requested routine annual check on 3kW system.', status: 'Open',
      createdAt: daysAgo(2), partsCost: 0, labourCost: 1500, customerConfirmed: false,
    },
  ],

  payments: [
    { id: 'pay-1', code: 'PAY-001', projectId: 'prj-1', customerId: 'cus-1', type: 'Advance', amount: 100000, status: 'Paid', date: daysAgo(85), method: 'Bank Transfer', reference: 'UTR882910', party: 'Rajesh Sharma' },
    { id: 'pay-2', code: 'PAY-002', projectId: 'prj-1', customerId: 'cus-1', type: 'Final', amount: 185000, status: 'Paid', date: daysAgo(66), method: 'Bank Transfer', reference: 'UTR882955', party: 'Rajesh Sharma' },
    { id: 'pay-3', code: 'PAY-003', projectId: 'prj-2', customerId: 'cus-2', type: 'Advance', amount: 87500, status: 'Paid', date: daysAgo(40), method: 'UPI', reference: 'UPI7720', party: 'Priya Patel' },
    { id: 'pay-4', code: 'PAY-004', projectId: 'prj-2', customerId: 'cus-2', type: 'Installment', amount: 52500, status: 'Paid', date: daysAgo(12), method: 'Cheque', reference: 'CHQ4402', party: 'Priya Patel' },
    { id: 'pay-5', code: 'PAY-005', projectId: 'prj-2', customerId: 'cus-2', type: 'Final', amount: 35000, status: 'Pending', date: daysAhead(3), method: 'Bank Transfer', reference: '', party: 'Priya Patel' },
    { id: 'pay-6', code: 'PAY-006', projectId: 'prj-3', customerId: 'cus-3', type: 'Advance', amount: 60000, status: 'Overdue', date: daysAgo(5), method: 'Bank Transfer', reference: '', party: 'Vikram Reddy' },
    { id: 'pay-7', code: 'SUP-001', projectId: 'prj-1', customerId: 'cus-1', type: 'Supplier', amount: 158000, status: 'Paid', date: daysAgo(80), method: 'Bank Transfer', reference: 'VND1120', party: 'Waaree Energies' },
  ],

  subsidies: [
    { id: 'sub-1', code: 'SUB-001', projectId: 'prj-1', customerId: 'cus-1', scheme: 'PM Surya Ghar Muft Bijli Yojana', eligibleAmount: 78000, appliedAmount: 78000, disbursedAmount: 78000, status: 'Disbursed', appliedDate: daysAgo(82), approvedDate: daysAgo(45), disbursedDate: daysAgo(20), documents: ['application.pdf', ' Aadhaar.pdf', 'utility_bill.pdf'] },
    { id: 'sub-2', code: 'SUB-002', projectId: 'prj-2', customerId: 'cus-2', scheme: 'PM Surya Ghar Muft Bijli Yojana', eligibleAmount: 45000, appliedAmount: 45000, disbursedAmount: 0, status: 'Under Review', appliedDate: daysAgo(35), documents: ['application.pdf', 'property.pdf'] },
  ],

  suppliers: [
    { id: 'sup-1', name: 'Waaree Energies', contact: 'Rahul Mehta', phone: '+91 22 4000 1111', email: 'sales@waaree.com', rating: 4.7, category: 'Panels' },
    { id: 'sup-2', name: 'Tata Power Solar', contact: 'Neha Singh', phone: '+91 80 4000 2222', email: 'b2b@tatapower.com', rating: 4.8, category: 'Panels' },
    { id: 'sup-3', name: 'SolarEdge India', contact: 'David Cohen', phone: '+91 80 4000 3333', email: 'in@solaredge.com', rating: 4.6, category: 'Inverters' },
    { id: 'sup-4', name: 'Luminous Power', contact: 'Sanjay Gupta', phone: '+91 11 4000 4444', email: 'b2b@luminous.com', rating: 4.4, category: 'Inverters & Batteries' },
    { id: 'sup-5', name: 'Exide Industries', contact: 'Amit Bose', phone: '+91 33 4000 5555', email: 'oem@exide.com', rating: 4.5, category: 'Batteries' },
    { id: 'sup-6', name: 'Gautam Solar', contact: 'Priya Gautam', phone: '+91 124 4000 6666', email: 'sales@gautamsolar.com', rating: 4.3, category: 'Mounting' },
    { id: 'sup-7', name: 'Polycab India', contact: 'Rajiv Khanna', phone: '+91 22 4000 7777', email: 'solar@polycab.com', rating: 4.5, category: 'Cables' },
  ],

  users: [
    { id: 'usr-1', name: 'Administrator', email: 'admin@solarsphere.io', role: 'Admin', status: 'Active', lastActive: '2026-10-31 09:10', permissions: ['All Modules', 'Settings', 'User Management'] },
    { id: 'usr-2', name: 'Meera Nair', email: 'meera@solarsphere.io', role: 'Sales Manager', status: 'Active', lastActive: '2026-10-31 08:45', permissions: ['Customers', 'Projects', 'Quotations', 'Subsidy'] },
    { id: 'usr-3', name: 'Arjun Verma', email: 'arjun@solarsphere.io', role: 'Surveyor', status: 'Active', lastActive: '2026-10-30 18:20', permissions: ['Surveys', 'Roof Intelligence', 'Installations'] },
    { id: 'usr-4', name: 'Karthik Iyer', email: 'karthik@solarsphere.io', role: 'Surveyor', status: 'Active', lastActive: '2026-10-30 17:00', permissions: ['Surveys', 'Roof Intelligence'] },
    { id: 'usr-5', name: 'Suresh Kumar', email: 'suresh@solarsphere.io', role: 'Technician', status: 'Active', lastActive: '2026-10-31 07:30', permissions: ['Installations', 'Service'] },
    { id: 'usr-6', name: 'Farhan Ahmed', email: 'farhan@solarsphere.io', role: 'Finance', status: 'Active', lastActive: '2026-10-30 19:10', permissions: ['Finance', 'Subsidy', 'Reports'] },
    { id: 'usr-7', name: 'Sneha Rao', email: 'sneha@solarsphere.io', role: 'Service Agent', status: 'Inactive', lastActive: '2026-10-20 14:00', permissions: ['Service & Complaints'] },
  ],

  notifications: [
    { id: 'n1', type: 'warning', title: 'Low Stock Alert', message: 'Tata Power 540W panels below reorder level (14 left)', time: '2h ago', read: false },
    { id: 'n2', type: 'error', title: 'Overdue Payment', message: 'PRJ-2026-003 advance payment overdue by 5 days', time: '5h ago', read: false },
    { id: 'n3', type: 'info', title: 'Survey Scheduled', message: 'Roof survey for Anita Desai scheduled for Nov 2', time: '6h ago', read: false },
    { id: 'n4', type: 'success', title: 'Installation Accepted', message: 'PRJ-2026-001 customer acceptance received from Rajesh Sharma', time: '1d ago', read: true },
    { id: 'n5', type: 'info', title: 'Subsidy Disbursed', message: 'SUB-001 subsidy of ₹78,000 disbursed for PRJ-2026-001', time: '20d ago', read: true },
  ],

  activities: [
    { id: 'a1', date: '2026-10-31 09:05', module: 'Installation', action: 'Customer acceptance received for PRJ-2026-001', by: 'System' },
    { id: 'a2', date: '2026-10-31 08:40', module: 'Service', action: 'New service ticket TKT-001 created for Rajesh Sharma', by: 'Meera Nair' },
    { id: 'a3', date: '2026-10-30 17:20', module: 'Finance', action: 'Payment PAY-004 recorded for Priya Patel', by: 'Farhan Ahmed' },
    { id: 'a4', date: '2026-10-30 16:10', module: 'Dispatch', action: 'DSP-002 shipped to Ahmedabad', by: 'Arjun Verma' },
    { id: 'a5', date: '2026-10-30 14:00', module: 'Quotation', action: 'Quotation QTN-2026-003 sent to Vikram Reddy', by: 'Karthik Iyer' },
    { id: 'a6', date: '2026-10-30 11:30', module: 'Survey', action: 'Survey srv-3 approved for PRJ-2026-003', by: 'Karthik Iyer' },
    { id: 'a7', date: '2026-10-29 10:15', module: 'Subsidy', action: 'Subsidy SUB-001 disbursed ₹78,000', by: 'System' },
  ],
};

