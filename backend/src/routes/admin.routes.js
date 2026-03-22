const express = require('express');
const { createUser, deleteUser, getUserCredentials } = require('../controllers/admin.controller');
const { createClinic, getClinics, getClinicDetail, updateClinic, deleteClinic } = require('../controllers/clinic.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// Clinic management
router.post('/create-clinic', createClinic);
router.get('/clinics', getClinics);
router.get('/clinic/:clinicId', getClinicDetail);
router.put('/clinic/:clinicId', updateClinic);
router.delete('/clinic/:clinicId', deleteClinic);

// User management
router.post('/create-user', createUser);
router.delete('/user/:userId', deleteUser);
router.get('/user/:userId/credentials', getUserCredentials);

module.exports = router;
