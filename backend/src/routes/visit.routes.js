const express = require('express');
const { createVisit, getPatientVisits, getVisit, getVisitsByPatient } = require('../controllers/visit.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

// Implements Rule 4: Only DOCTOR and DIETITIAN can create/manage visits
router.post('/', protect, requireRole(['DOCTOR', 'DIETITIAN']), createVisit);
router.get('/patient/:patientId', protect, getPatientVisits);
router.get('/api/patient/:patientId', protect, getVisitsByPatient); // Phase 3
router.get('/:id', protect, getVisit);

module.exports = router;
