export const normalizeRoleName = (role) => {
  const value = String(role ?? '').trim();
  const aliases = {
    Surveyor: 'SURVEY_TECHNICIAN',
    'Survey Technician': 'SURVEY_TECHNICIAN',
    'SURVEY_TECHNICIAN': 'SURVEY_TECHNICIAN',
    Technician: 'INSTALLATION_TECHNICIAN',
    'Installation Technician': 'INSTALLATION_TECHNICIAN',
    'INSTALLATION_TECHNICIAN': 'INSTALLATION_TECHNICIAN',
  };

  return aliases[value] || value;
};

export const requiresRevisionForApprovedBom = (existingQuote, nextBom, { allowRevision = false } = {}) => {
  if (!existingQuote || !existingQuote.bomApproved) return false;
  if (allowRevision) return false;

  const currentItems = Array.isArray(existingQuote.items) ? existingQuote.items : [];
  const nextItems = Array.isArray(nextBom) ? nextBom : [];

  return JSON.stringify(currentItems) !== JSON.stringify(nextItems);
};
