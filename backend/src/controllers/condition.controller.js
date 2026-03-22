const Condition = require('../models/Condition');

// @desc    Get all conditions (system-level + caller's clinic)
// @route   GET /conditions
// @access  Private
const getAllConditions = async (req, res) => {
    try {
        const userClinicId = req.user.clinic?._id || req.user.clinic;

        // System-level conditions (clinicId: null) + this clinic's conditions
        const filter = {
            $or: [
                { clinicId: null },
                ...(userClinicId ? [{ clinicId: userClinicId }] : [])
            ]
        };

        const conditions = await Condition.find(filter)
            .populate('avoidFoods', 'name category')
            .populate('recommendedFoods', 'name category')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: conditions.length,
            data: conditions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a condition
// @route   POST /conditions
// @access  Private (admin/dietitian)
const createCondition = async (req, res) => {
    try {
        const {
            name, ayurvedicName, description,
            aggravatedDoshas, recommendedRasa, avoidRasa,
            recommendedFoodCategories, avoidFoodCategories,
            avoidFoods, recommendedFoods, clinicId
        } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Condition name is required' });
        }

        const condition = await Condition.create({
            name,
            ...(ayurvedicName !== undefined && { ayurvedicName }),
            ...(description !== undefined && { description }),
            ...(aggravatedDoshas !== undefined && { aggravatedDoshas }),
            ...(recommendedRasa !== undefined && { recommendedRasa }),
            ...(avoidRasa !== undefined && { avoidRasa }),
            ...(recommendedFoodCategories !== undefined && { recommendedFoodCategories }),
            ...(avoidFoodCategories !== undefined && { avoidFoodCategories }),
            ...(avoidFoods !== undefined && { avoidFoods }),
            ...(recommendedFoods !== undefined && { recommendedFoods }),
            clinicId: clinicId || null
        });

        res.status(201).json({ success: true, data: condition });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A condition with this name already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get one condition by ID
// @route   GET /conditions/:id
// @access  Private
const getCondition = async (req, res) => {
    try {
        const condition = await Condition.findById(req.params.id)
            .populate('avoidFoods', 'name category')
            .populate('recommendedFoods', 'name category');

        if (!condition) {
            return res.status(404).json({ success: false, message: 'Condition not found' });
        }

        res.status(200).json({ success: true, data: condition });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a condition
// @route   PUT /conditions/:id
// @access  Private
const updateCondition = async (req, res) => {
    try {
        const condition = await Condition.findById(req.params.id);
        if (!condition) {
            return res.status(404).json({ success: false, message: 'Condition not found' });
        }

        const updatableFields = [
            'name', 'ayurvedicName', 'description', 'aggravatedDoshas',
            'recommendedRasa', 'avoidRasa', 'recommendedFoodCategories',
            'avoidFoodCategories', 'avoidFoods', 'recommendedFoods', 'clinicId'
        ];
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) condition[field] = req.body[field];
        });

        await condition.save();
        res.status(200).json({ success: true, data: condition });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A condition with this name already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a condition
// @route   DELETE /conditions/:id
// @access  Private (admin only)
const deleteCondition = async (req, res) => {
    try {
        const condition = await Condition.findById(req.params.id);
        if (!condition) {
            return res.status(404).json({ success: false, message: 'Condition not found' });
        }

        await condition.deleteOne();
        res.status(200).json({ success: true, message: 'Condition deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllConditions,
    createCondition,
    getCondition,
    updateCondition,
    deleteCondition
};
