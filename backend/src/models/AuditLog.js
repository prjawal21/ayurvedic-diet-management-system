const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    entityType: {
        type: String,
        required: [true, 'Please provide entity type'],
        enum: ['Patient', 'Visit', 'DietChart', 'User', 'Clinic'],
        index: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide entity ID'],
        index: true
    },
    action: {
        type: String,
        required: [true, 'Please provide action type'],
        enum: ['create', 'update', 'delete', 'view'],
        index: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user who performed the action'],
        index: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: [true, 'Please provide clinic reference'],
        index: true
    },
    changes: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        // Stores { field: { old: value, new: value } } for updates
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        // Additional context: IP address, user agent, etc.
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
        index: true
    }
}, {
    timestamps: false // Using custom timestamp field
});

// Compound indexes for efficient queries
auditLogSchema.index({ clinic: 1, timestamp: -1 });
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ clinic: 1, entityType: 1, action: 1, timestamp: -1 });

// Static method to create audit log entry
auditLogSchema.statics.log = async function (data) {
    try {
        return await this.create({
            entityType: data.entityType,
            entityId: data.entityId,
            action: data.action,
            performedBy: data.performedBy,
            clinic: data.clinic,
            changes: data.changes || {},
            metadata: data.metadata || {},
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw - audit logging should not break main operations
    }
};

// Static method to get audit trail for an entity
auditLogSchema.statics.getTrail = async function (entityType, entityId) {
    return await this.find({ entityType, entityId })
        .sort({ timestamp: -1 })
        .populate('performedBy', 'name email role')
        .populate('clinic', 'name')
        .lean();
};

// Static method to get clinic activity
auditLogSchema.statics.getClinicActivity = async function (clinicId, options = {}) {
    const query = { clinic: clinicId };

    if (options.entityType) {
        query.entityType = options.entityType;
    }

    if (options.action) {
        query.action = options.action;
    }

    if (options.performedBy) {
        query.performedBy = options.performedBy;
    }

    if (options.startDate || options.endDate) {
        query.timestamp = {};
        if (options.startDate) query.timestamp.$gte = options.startDate;
        if (options.endDate) query.timestamp.$lte = options.endDate;
    }

    return await this.find(query)
        .sort({ timestamp: -1 })
        .limit(options.limit || 100)
        .populate('performedBy', 'name email role')
        .lean();
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
