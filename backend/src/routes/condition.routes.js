const express = require('express');
const {
    getAllConditions,
    createCondition,
    getCondition,
    updateCondition,
    deleteCondition
} = require('../controllers/condition.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getAllConditions);
router.post('/', protect, createCondition);
router.get('/:id', protect, getCondition);
router.put('/:id', protect, updateCondition);
router.delete('/:id', protect, deleteCondition);

module.exports = router;
