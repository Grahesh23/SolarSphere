import test from 'node:test';
import assert from 'node:assert/strict';

import { isSurveyReadyForQuotation, isProjectEligibleForQuotation } from './quotationEligibility.js';

test('submitted and approved surveys are ready to generate quotations', () => {
  assert.equal(isSurveyReadyForQuotation({ status: 'Submitted' }), true);
  assert.equal(isSurveyReadyForQuotation({ status: 'Approved' }), true);
  assert.equal(isSurveyReadyForQuotation({ status: 'Scheduled' }), false);
});

test('projects with submitted surveys are eligible unless a quote is already approved or linked', () => {
  const project = { id: 'p1', quotationId: null };
  const survey = { status: 'Submitted' };

  assert.equal(isProjectEligibleForQuotation({ project, survey, quotations: [] }), true);
  assert.equal(isProjectEligibleForQuotation({ project, survey, quotations: [{ projectId: 'p1', bomApproved: true }] }), false);
  assert.equal(isProjectEligibleForQuotation({ project: { ...project, quotationId: 'q1' }, survey, quotations: [] }), false);
});
