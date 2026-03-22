// Role-based access control middleware

/**
 * Middleware to check if user has required role(s)
 * Implements Rule 4: Role-based permissions
 * 
 * @param {Array<string>} roles - Array of allowed roles (e.g., ['ADMIN'], ['DOCTOR', 'DIETITIAN'])
 * @returns {Function} Express middleware function
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        // Ensure user is authenticated (protect middleware should run first)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user's role is in the allowed roles (case-insensitive)
        const userRole = req.user.role ? req.user.role.toUpperCase() : '';
        const allowedRoles = roles.map(role => role.toUpperCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = { requireRole };
