export const isSurveyReadyForQuotation = (survey) => {
  if (!survey) return false;
  return ['Submitted', 'Approved'].includes(survey.status);
};

export const isProjectEligibleForQuotation = ({ project, survey, quotations = [] }) => {
  if (!project || !survey) return false;
  if (!isSurveyReadyForQuotation(survey)) return false;
  if (project.quotationId) return false;

  const existingApprovedQuote = quotations.some((quote) => quote.projectId === project.id && quote.bomApproved);
  return !existingApprovedQuote;
};
