const Food = require('../models/Food');

// @desc    Create a new food item
// @route   POST /foods
// @access  Private
const createFood = async (req, res) => {
    try {
        const {
            name, calories, protein, carbs, fat,
            rasa, guna, vipaka, virya, digestibility, category,
            meal_type, dosha_suitable, agni_level, source, isClinicApproved,
            // Micronutrients (all optional)
            iron, calcium, vitaminC, vitaminD, vitaminB12,
            zinc, magnesium, omega3, folate, potassium, sodium
        } = req.body;

        // Validate required fields
        if (!name || calories === undefined || protein === undefined || carbs === undefined ||
            fat === undefined || !virya || !category || !meal_type || !dosha_suitable || !agni_level) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Build food document — all optional fields spread conditionally
        const foodData = {
            name, calories, protein, carbs, fat, virya, category,
            meal_type, dosha_suitable, agni_level,
            source: source || 'Custom',
            isClinicApproved: isClinicApproved !== undefined ? isClinicApproved : true,
            ...(rasa !== undefined && { rasa }),
            ...(digestibility !== undefined && { digestibility }),
            ...(guna !== undefined && { guna }),
            ...(vipaka !== undefined && { vipaka }),
            ...(iron !== undefined && { iron }),
            ...(calcium !== undefined && { calcium }),
            ...(vitaminC !== undefined && { vitaminC }),
            ...(vitaminD !== undefined && { vitaminD }),
            ...(vitaminB12 !== undefined && { vitaminB12 }),
            ...(zinc !== undefined && { zinc }),
            ...(magnesium !== undefined && { magnesium }),
            ...(omega3 !== undefined && { omega3 }),
            ...(folate !== undefined && { folate }),
            ...(potassium !== undefined && { potassium }),
            ...(sodium !== undefined && { sodium })
        };

        const food = await Food.create(foodData);

        res.status(201).json({
            success: true,
            data: food
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Food item with this name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all food items
// @route   GET /foods
// @access  Private
const getAllFoods = async (req, res) => {
    try {
        const query = {};
        if (req.query.isClinicApproved === 'true') {
            query.isClinicApproved = true;
        }
        const foods = await Food.find(query).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createFood,
    getAllFoods
};
