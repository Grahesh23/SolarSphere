import test from 'node:test';
import assert from 'node:assert/strict';
import { isSurveyTechnicianRole, isInstallationTechnicianRole, normalizeTechnicianRole } from '../controllers/workflowController.js';
import { roleMatchesRequestedRole } from '../controllers/authController.js';

test('legacy and canonical survey technician role names are treated as the same assignment type', () => {
  assert.equal(isSurveyTechnicianRole('Surveyor'), true);
  assert.equal(isSurveyTechnicianRole('SURVEY_TECHNICIAN'), true);
  assert.equal(normalizeTechnicianRole('Surveyor'), 'SURVEY_TECHNICIAN');
});

test('legacy and canonical installation technician role names are treated as the same assignment type', () => {
  assert.equal(isInstallationTechnicianRole('Technician'), true);
  assert.equal(isInstallationTechnicianRole('INSTALLATION_TECHNICIAN'), true);
  assert.equal(normalizeTechnicianRole('Technician'), 'INSTALLATION_TECHNICIAN');
});

test('survey and installation roles never cross over in the same assignment category', () => {
  assert.equal(isSurveyTechnicianRole('INSTALLATION_TECHNICIAN'), false);
  assert.equal(isInstallationTechnicianRole('SURVEY_TECHNICIAN'), false);
});

test('login can validate that the selected role matches the account type', () => {
  assert.equal(roleMatchesRequestedRole('SURVEY_TECHNICIAN', 'Surveyor'), true);
  assert.equal(roleMatchesRequestedRole('SURVEY_TECHNICIAN', 'Technician'), false);
  assert.equal(roleMatchesRequestedRole('INSTALLATION_TECHNICIAN', 'Technician'), true);
  assert.equal(roleMatchesRequestedRole('INSTALLATION_TECHNICIAN', 'Surveyor'), false);
});
