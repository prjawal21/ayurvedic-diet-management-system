const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide food name'],
        trim: true,
        unique: true
    },
    category: {
        type: String,
        required: [true, 'Please provide food category'],
        enum: ['Grain', 'Vegetable', 'Fruit', 'Dairy', 'Legume', 'Fat', 'Nut', 'Seed', 'Spice', 'Herb']
    },
    meal_type: {
        type: String,
        required: [true, 'Please provide meal type'],
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'All']
    },
    dosha_suitable: {
        type: String,
        required: [true, 'Please provide suitable dosha'],
        enum: ['Vata', 'Pitta', 'Kapha', 'Dual', 'Tridosha']
    },
    agni_level: {
        type: String,
        required: [true, 'Please provide agni level'],
        enum: ['Low', 'Medium', 'High']

    },
    virya: {
        type: String,
        required: [true, 'Please provide virya (potency)'],
        enum: ['Warming', 'Cooling']
    },
    // Nutrition per 100g
    energy: {
        type: Number,
        required: [true, 'Please provide energy (kcal per 100g)'],
        min: 0
    },
    calories: {
        type: Number,
        default: 0
    },
    protein: {
        type: Number,
        required: [true, 'Please provide protein (g per 100g)'],
        min: 0
    },
    carbs: {
        type: Number,
        required: [true, 'Please provide carbohydrates (g per 100g)'],
        min: 0
    },
    carbohydrates: {
        type: Number,
        default: 0
    },
    fat: {
        type: Number,
        required: [true, 'Please provide fat (g per 100g)'],
        min: 0
    },
    fiber: {
        type: Number,
        required: [true, 'Please provide fiber (g per 100g)'],
        min: 0,
        default: 0
    },
    glycemic_index: {
        type: Number,
        required: [true, 'Please provide glycemic index'],
        min: 0,
        max: 100
    },
    source: {
        type: String,
        required: [true, 'Please provide data source'],
        trim: true
    },
    // Ayurvedic taste profile
    rasa: {
        type: [String],
        enum: ['Madhura', 'Amla', 'Lavana', 'Katu', 'Tikta', 'Kashaya'],
        required: false,
        default: undefined
    },
    // Ayurvedic quality profile
    guna: {
        type: [String],
        enum: ['Laghu', 'Guru', 'Snigdha', 'Ruksha', 'Ushna', 'Sheeta', 'Tikshna', 'Manda',
            'Sthira', 'Sara', 'Mridu', 'Kathina', 'Vishada', 'Picchila', 'Slakshna',
            'Khara', 'Sukshma', 'Sthula', 'Sandra', 'Drava'],
        required: false,
        default: undefined
    },
    // Ayurvedic post-digestive taste
    vipaka: {
        type: String,
        enum: ['Madhura', 'Amla', 'Katu'],
        required: false
    },
    // Micronutrients per 100g — populated when food dataset is imported
    iron: { type: Number, default: 0 },      // mg
    calcium: { type: Number, default: 0 },      // mg
    vitaminC: { type: Number, default: 0 },      // mg
    vitaminD: { type: Number, default: 0 },      // IU
    vitaminB12: { type: Number, default: 0 },      // mcg
    zinc: { type: Number, default: 0 },      // mg
    magnesium: { type: Number, default: 0 },      // mg
    omega3: { type: Number, default: 0 },      // mg
    folate: { type: Number, default: 0 },      // mcg
    potassium: { type: Number, default: 0 },      // mg
    sodium: { type: Number, default: 0 },      // mg

    // Curation flag: only approved foods are used in diet generation
    isClinicApproved: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Food', foodSchema);
