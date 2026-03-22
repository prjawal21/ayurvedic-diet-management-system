const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide patient name'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Please provide patient age'],
        min: 1,
        max: 120
    },
    gender: {
        type: String,
        required: [true, 'Please provide patient gender'],
        enum: ['Male', 'Female', 'Other']
    },
    prakriti: {
        type: String,
        required: [true, 'Please provide patient prakriti'],
        enum: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha']
    },
    dietaryPreference: {
        type: String,
        required: [true, 'Please provide dietary preference'],
        enum: ['Veg', 'Non-Veg']
    },
    digestionStrength: {
        type: String,
        required: [true, 'Please provide digestion strength'],
        enum: ['Low', 'Medium', 'High']
    },
    waterIntake: {
        type: Number,
        required: [true, 'Please provide water intake in liters'],
        min: 0
    },
    bowelMovement: {
        type: String,
        required: [true, 'Please provide bowel movement status'],
        enum: ['Regular', 'Irregular']
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: [true, 'Please provide clinic reference']
    },
    currentSeason: {
        type: String,
        enum: ['Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta', 'Shishira'],
        required: false,
        default: null
    },
    // Body metrics for Mifflin-St Jeor BMR calculation
    weight: {
        type: Number,
        required: false,
        min: 1,
        max: 500
    },
    height: {
        type: Number,
        required: false,
        min: 30,
        max: 300
    },
    activityLevel: {
        type: String,
        enum: ['Sedentary', 'LightlyActive', 'ModeratelyActive', 'VeryActive', 'ExtraActive'],
        required: false,
        default: 'Sedentary'
    },
    // Medical conditions linked to this patient
    conditions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Condition'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
