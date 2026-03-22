const express = require('express');
const { createFood, getAllFoods } = require('../controllers/food.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, createFood);
router.get('/', protect, getAllFoods);

module.exports = router;
