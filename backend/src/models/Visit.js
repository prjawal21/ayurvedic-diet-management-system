const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please provide patient reference']
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: [true, 'Please provide clinic reference']
    },
    conductedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide conducting doctor/dietitian reference']
    },
    visitDate: {
        type: Date,
        required: [true, 'Please provide visit date'],
        default: Date.now
    },
    chiefComplaint: {
        type: String,
        trim: true,
        default: ''
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    doshaImbalanceSeverity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe'],
        default: 'Moderate',
        required: false
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
visitSchema.index({ patient: 1, visitDate: -1 });
visitSchema.index({ clinic: 1, visitDate: -1 });

module.exports = mongoose.model('Visit', visitSchema);
