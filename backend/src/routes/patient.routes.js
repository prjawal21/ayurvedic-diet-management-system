const express = require('express');
const { createPatient, getAllPatients, getPatient, updatePatient, deletePatient } = require('../controllers/patient.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, createPatient);
router.get('/', protect, getAllPatients);
router.get('/:id', protect, getPatient);
router.put('/:id', protect, updatePatient);
router.delete('/:id', protect, deletePatient);

module.exports = router;
