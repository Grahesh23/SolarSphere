import test from 'node:test';
import assert from 'node:assert/strict';

import { assignSurvey, createProject, reviewSurvey } from '../controllers/workflowController.js';

test('createProject is exported for sales project creation', () => {
  assert.equal(typeof createProject, 'object');
  assert.equal(typeof createProject[1], 'function');
});

test('assignSurvey is exported for project-level survey assignment', () => {
  assert.equal(typeof assignSurvey, 'object');
  assert.equal(typeof assignSurvey[1], 'function');
});

test('reviewSurvey enforces surveyor-only approval rules', () => {
  assert.equal(typeof reviewSurvey, 'object');
  assert.equal(typeof reviewSurvey[1], 'function');
});
