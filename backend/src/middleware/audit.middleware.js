const AuditLog = require('../models/AuditLog');

/**
 * Middleware to automatically log audit entries for entity changes
 * Usage: Add to controller after successful operation
 */

const logAudit = async (req, entityType, entityId, action, changes = {}) => {
    try {
        // Extract clinic from user or entity
        const clinic = req.user.clinic._id || req.user.clinic;

        await AuditLog.log({
            entityType,
            entityId,
            action,
            performedBy: req.user._id,
            clinic,
            changes,
            metadata: {
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                role: req.user.role
            }
        });
    } catch (error) {
        // Log error but don't throw - audit logging should not break operations
        console.error('Audit logging failed:', error.message);
    }
};

/**
 * Helper to extract changes between old and new objects
 */
const extractChanges = (oldObj, newObj, fields) => {
    const changes = {};

    fields.forEach(field => {
        const oldValue = oldObj?.[field];
        const newValue = newObj?.[field];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes[field] = {
                old: oldValue,
                new: newValue
            };
        }
    });

    return changes;
};

module.exports = {
    logAudit,
    extractChanges
};
