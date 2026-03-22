const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    foodItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    quantity: {
        type: String,
        default: '1 serving'
    }
}, { _id: false });

const dietChartSchema = new mongoose.Schema({
    visit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visit',
        required: [true, 'Please provide visit reference']
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
        // NOTE: This field is denormalized from visit.patient for query convenience only (Rule 2)
        // Source of truth is visit.patient - never update this independently
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: [true, 'Please provide clinic reference']
    },
    version: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    breakfast: [mealSchema],
    midMorningSnack: [mealSchema],
    lunch: [mealSchema],
    eveningSnack: [mealSchema],
    dinner: [mealSchema],
    totalNutrients: {
        // Macronutrients
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 },
        // Micronutrients
        iron: { type: Number, default: 0 },
        calcium: { type: Number, default: 0 },
        vitaminC: { type: Number, default: 0 },
        vitaminD: { type: Number, default: 0 },
        vitaminB12: { type: Number, default: 0 },
        zinc: { type: Number, default: 0 },
        magnesium: { type: Number, default: 0 },
        omega3: { type: Number, default: 0 },
        folate: { type: Number, default: 0 },
        potassium: { type: Number, default: 0 },
        sodium: { type: Number, default: 0 }
    },
    ayurvedaAttributes: {
        viryaBalance: {
            type: String,
            default: ''
        },
        agniProfile: {
            type: String,
            default: ''
        }
    },
    complianceNotes: {
        type: [String],
        default: []
    },
    doctorNotes: {
        type: String,
        default: '',
        trim: true
    },
    manualOverrides: [{
        meal: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner'],
            required: true
        },
        action: {
            type: String,
            enum: ['add', 'remove'],
            required: true
        },
        originalFood: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food'
        },
        replacementFood: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food'
        },
        reason: {
            type: String,
            default: ''
        },
        safetyOverride: {
            type: Boolean,
            default: false
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    isManuallyModified: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
dietChartSchema.index({ visit: 1, version: -1 });
dietChartSchema.index({ patient: 1, isActive: 1, createdAt: -1 });
dietChartSchema.index({ clinic: 1, isActive: 1 });

module.exports = mongoose.model('DietChart', dietChartSchema);
