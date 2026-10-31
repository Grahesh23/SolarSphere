export function getVisibleSurveysForSurveyor({ surveys = [], user }) {
  if (!user) return [];

  const role = user.role;
  if (['Surveyor', 'SURVEY_TECHNICIAN'].includes(role)) {
    return surveys;
  }

  return [];
}
