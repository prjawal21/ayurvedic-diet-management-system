const mongoose = require('mongoose');

const RASA_ENUM = ['Madhura', 'Amla', 'Lavana', 'Katu', 'Tikta', 'Kashaya'];
const DOSHA_ENUM = ['Vata', 'Pitta', 'Kapha'];

const conditionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide condition name'],
        unique: true,
        trim: true
        // e.g. "Type 2 Diabetes", "Hypertension", "PCOS"
    },
    ayurvedicName: {
        type: String,
        trim: true
        // e.g. "Madhumeha", "Raktagata Vata"
    },
    description: {
        type: String,
        trim: true
    },
    aggravatedDoshas: {
        type: [String],
        enum: DOSHA_ENUM
    },
    recommendedRasa: {
        type: [String],
        enum: RASA_ENUM
    },
    avoidRasa: {
        type: [String],
        enum: RASA_ENUM
    },
    recommendedFoodCategories: {
        type: [String]
    },
    avoidFoodCategories: {
        type: [String]
    },
    avoidFoods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }],
    recommendedFoods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }],
    // null = system-level condition (available to all clinics)
    // non-null = clinic-specific condition
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: false,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient lookup by clinic (nulls = system-level)
conditionSchema.index({ clinicId: 1, name: 1 });

module.exports = mongoose.model('Condition', conditionSchema);
