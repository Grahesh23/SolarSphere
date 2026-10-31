import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeRoleName, requiresRevisionForApprovedBom } from './bomRevision.js';

test('login role aliases normalize to the canonical survey and installation role values', () => {
  assert.equal(normalizeRoleName('Surveyor'), 'SURVEY_TECHNICIAN');
  assert.equal(normalizeRoleName('Survey Technician'), 'SURVEY_TECHNICIAN');
  assert.equal(normalizeRoleName('Technician'), 'INSTALLATION_TECHNICIAN');
  assert.equal(normalizeRoleName('Installation Technician'), 'INSTALLATION_TECHNICIAN');
});

test('an approved BOM cannot be silently replaced without explicit revision intent', () => {
  const existingApproved = { bomApproved: true, items: [{ component: 'Panel', qty: 3 }] };
  const nextBom = [{ component: 'Panel', qty: 5 }];

  assert.equal(requiresRevisionForApprovedBom(existingApproved, nextBom), true);
  assert.equal(requiresRevisionForApprovedBom(existingApproved, existingApproved.items, { allowRevision: true }), false);
  assert.equal(requiresRevisionForApprovedBom({ bomApproved: false, items: [{ component: 'Panel', qty: 3 }] }, nextBom), false);
});
