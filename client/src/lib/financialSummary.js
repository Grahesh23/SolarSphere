export function safeNumber(value) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

export function getProjectFinancialSummary({
  project,
  quotation = null,
  payments = [],
  purchases = [],
  expenses = [],
  technicianPayments = [],
  installations = [],
}) {
  if (!project) return { revenue: 0, totalProjectCost: 0, grossProfit: 0, profitMargin: 0, costBreakdown: {}, paymentStatus: 'Unpaid' };

  const quoteValue = safeNumber(
    quotation?.grandTotal ??
    quotation?.totalAmount ??
    quotation?.amount ??
    quotation?.total ??
    project?.quotedAmount ??
    project?.totalCost ??
    0
  );

  const additionalCharges = payments
    .filter((payment) => payment.projectId === project.id && ['Additional Charge', 'Adjustment', 'Surcharge'].includes(payment.type))
    .reduce((sum, payment) => sum + safeNumber(payment.amount), 0);

  const revenue = quoteValue + additionalCharges;

  const projectPurchases = purchases.filter((item) => item.projectId === project.id);
  const projectExpenses = expenses.filter((item) => item.projectId === project.id);
  const projectInstallations = installations.filter((item) => item.projectId === project.id);
  const projectTechnicianPayments = technicianPayments.filter((item) => item.projectId === project.id);

  const purchaseCost = projectPurchases.reduce((sum, item) => sum + safeNumber(item.totalAmount ?? item.amount), 0);
  const expenseCost = projectExpenses.reduce((sum, item) => sum + safeNumber(item.amount), 0);
  const labourCost = projectInstallations.reduce((sum, item) => sum + safeNumber(item.labourCost), 0);
  const techCost = projectTechnicianPayments.reduce((sum, item) => sum + safeNumber(item.amount), 0);

  const estimatedCost = safeNumber(project.estimatedCost ?? project.totalCost ?? quotation?.estimatedCost ?? 0);
  const actualRecordedCost = purchaseCost + expenseCost + labourCost + techCost;
  const totalProjectCost = actualRecordedCost || estimatedCost || safeNumber(project.totalCost);

  const grossProfit = revenue - totalProjectCost;
  const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const receivePaid = payments
    .filter((payment) => payment.projectId === project.id && payment.type !== 'Supplier' && payment.type !== 'Technician' && payment.status === 'Paid')
    .reduce((sum, payment) => sum + safeNumber(payment.amount), 0);
  const outstanding = Math.max(revenue - receivePaid, 0);

  return {
    projectId: project.id,
    code: project.code,
    revenue,
    totalRevenue: revenue,
    totalProjectCost,
    grossProfit,
    profitMargin,
    estimatedCost,
    actualRecordedCost,
    outstanding,
    costBreakdown: {
      equipment: purchaseCost,
      otherExpenses: expenseCost,
      installationLabour: labourCost,
      technicianPayments: techCost,
    },
    paymentStatus: outstanding > 0 ? 'Outstanding' : 'Clear',
  };
}

export function getTechnicianPerformance({ technicians = [], installations = [], technicianPayments = [] }) {
  return technicians.map((tech) => {
    const techInstallations = installations.filter((inst) => inst.technicianId === tech.id || inst.technicianName === tech.name);
    const totalHours = techInstallations.reduce((sum, inst) => {
      if (!inst.startedAt || !inst.finishedAt) return sum;
      const started = new Date(inst.startedAt);
      const finished = new Date(inst.finishedAt);
      if (Number.isNaN(started.getTime()) || Number.isNaN(finished.getTime())) return sum;
      return sum + Math.max((finished - started) / 3600000, 0);
    }, 0);

    const completedInstallations = techInstallations.filter((inst) => ['Completed', 'Accepted', 'Pending Verification'].includes(inst.status)).length;
    const pendingAssignments = techInstallations.filter((inst) => ['Scheduled', 'In Progress', 'Testing'].includes(inst.status)).length;
    const labourCost = techInstallations.reduce((sum, inst) => sum + safeNumber(inst.labourCost), 0);
    const paymentsMade = technicianPayments
      .filter((item) => item.technicianId === tech.id || item.technicianName === tech.name)
      .reduce((sum, item) => sum + safeNumber(item.amount), 0);

    return {
      technicianId: tech.id,
      name: tech.name,
      totalHours,
      completedInstallations,
      pendingAssignments,
      labourCost,
      paymentsMade,
      paymentStatus: paymentsMade >= labourCost ? 'Paid' : 'Pending',
      projectCount: new Set(techInstallations.map((item) => item.projectId)).size,
    };
  });
}

export function buildInvoiceFromProject({ project, customer, quotation = null, payments = [] }) {
  const quoteValue = safeNumber(
    quotation?.grandTotal ??
    quotation?.totalAmount ??
    quotation?.total ??
    project?.quotedAmount ??
    project?.totalCost ??
    0
  );
  const paid = payments
    .filter((payment) => payment.projectId === project.id && payment.type !== 'Supplier' && payment.type !== 'Technician' && payment.status === 'Paid')
    .reduce((sum, payment) => sum + safeNumber(payment.amount), 0);

  const invoiceNumber = `INV-${project.code || 'SOLAR'}-${String(Date.now()).slice(-5)}`;
  const amountDue = Math.max(quoteValue - paid, 0);

  return {
    id: `invoice-${Date.now()}`,
    invoiceNumber,
    projectId: project.id,
    customerId: customer?.id ?? project.customerId,
    customerName: customer?.name ?? 'Customer',
    projectCode: project.code,
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    totalAmount: quoteValue,
    amountPaid: paid,
    outstandingAmount: amountDue,
    status: amountDue > 0 ? (paid > 0 ? 'Partially Paid' : 'Unpaid') : 'Paid',
    items: [
      {
        description: `${project.code} solar installation`,
        quantity: 1,
        unitPrice: quoteValue,
        total: quoteValue,
      },
    ],
  };
}
