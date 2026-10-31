export function toISODate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function getWarrantyEligibility({ equipment, today = new Date().toISOString().slice(0, 10) } = {}) {
  if (!equipment) return 'Warranty Record Not Found';

  const hasStart = Boolean(equipment.warrantyStart);
  const hasEnd = Boolean(equipment.warrantyEnd);
  if (!hasStart || !hasEnd) return 'Warranty Not Activated';

  const start = new Date(equipment.warrantyStart);
  const end = new Date(equipment.warrantyEnd);
  const now = new Date(today);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Warranty Record Not Found';
  }

  if (now < start) return 'Warranty Not Activated';
  if (now <= end) return 'In Warranty';
  return 'Out of Warranty';
}

export function canStartInstallation({ installation, project, dispatch, payments = [], equipment = [] }) {
  if (!project) return { allowed: false, reason: 'Project data is missing.' };
  if (installation?.startedAt || installation?.status === 'In Progress' || installation?.status === 'Pending Verification') {
    return { allowed: false, reason: 'Installation has already started or is already in progress.' };
  }

  const paid = payments.some((payment) => payment.projectId === project.id && ['Paid', 'Completed', 'Approved', 'Settled'].includes(payment.status));
  const delivered = dispatch?.status === 'Delivered';
  const materialReady = equipment.some((item) => item.projectId === project.id && ['Dispatched', 'Delivered'].includes(item.status));

  if (!paid) return { allowed: false, reason: 'Project payment must be completed before installation can start.' };
  if (!delivered) return { allowed: false, reason: 'Equipment must be dispatched and delivered before installation can start.' };
  if (!materialReady) return { allowed: false, reason: 'Material delivery is not confirmed for this project.' };

  return { allowed: true, reason: '' };
}

export function canCompleteInstallation({ installation }) {
  if (!installation?.startedAt) {
    return { allowed: false, reason: 'Installation must be started before it can be finished.' };
  }

  if (['Completed', 'Pending Verification', 'Accepted', 'Rejected'].includes(installation.status)) {
    return { allowed: false, reason: 'This installation has already been completed or is awaiting review.' };
  }

  return { allowed: true, reason: '' };
}

export function validateCapacity({ approvedCapacity, actualInstalledCapacity }) {
  const approved = Number(approvedCapacity || 0);
  const actual = Number(actualInstalledCapacity || 0);
  const matches = approved > 0 && actual > 0 && Math.abs(actual - approved) < 0.001;

  return {
    approved,
    actual,
    matches,
    difference: Math.abs(actual - approved),
  };
}
