import test from 'node:test';
import assert from 'node:assert/strict';

import { getVisibleSurveysForSurveyor } from './surveyAccess.js';

const surveys = [
  { id: 'a', assignedTo: 'Survey Tech 01', technicianId: 'tech-1', status: 'Scheduled' },
  { id: 'b', assignedTo: 'Survey Tech 02', technicianId: 'tech-2', status: 'Submitted' },
  { id: 'c', assignedTo: 'Survey Tech 03', technicianId: 'tech-3', status: 'Approved' },
];

test('survey team accounts see the full survey queue', () => {
  const visible = getVisibleSurveysForSurveyor({ surveys, user: { role: 'Surveyor', name: 'Survey Manager', id: 'manager-1' } });
  assert.deepEqual(visible.map((survey) => survey.id), ['a', 'b', 'c']);

  const technicianVisible = getVisibleSurveysForSurveyor({ surveys, user: { role: 'SURVEY_TECHNICIAN', name: 'Survey Tech 02', id: 'tech-2' } });
  assert.deepEqual(technicianVisible.map((survey) => survey.id), ['a', 'b', 'c']);
});
