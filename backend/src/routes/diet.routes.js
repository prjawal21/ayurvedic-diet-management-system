const express = require('express');
const {
    generateDiet,
    saveDiet,
    generateDietChart,
    getDietChart,
    getDietChartById,
    getDietChartByVisit,
    getDietChartHistory,
    editDiet
} = require('../controllers/diet.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Phase 3: Doctor Workflow Routes (Restricted to Doctor and Dietitian roles)
router.post('/api/generate', protect, authorize('Doctor', 'Dietitian'), generateDiet);
router.post('/api/save', protect, authorize('Doctor', 'Dietitian'), saveDiet);
router.put('/api/:dietChartId/edit', protect, authorize('Doctor', 'Dietitian'), editDiet);

// Visit-based diet queries
router.get('/visit/:visitId/history', protect, getDietChartHistory);
router.get('/visit/:visitId', protect, getDietChartByVisit);

// Legacy routes (Phase 1/2)
router.post('/generate', protect, generateDietChart);

// Single diet chart by its own ID (for Edit page load) — MUST be before /:patientId
router.get('/api/chart/:dietChartId', protect, getDietChartById);

// Patient-based diet query (type=patient in DietChart.jsx)
router.get('/:patientId', protect, getDietChart);

module.exports = router;

