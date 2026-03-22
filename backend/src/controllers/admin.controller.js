const User = require('../models/User');
const Clinic = require('../models/Clinic');
const { generateUsername, generateSecurePassword } = require('../utils/credentialGenerator');
const { encryptPassword, decryptPassword, maskString } = require('../utils/encryption');

/**
 * @desc    Create a new user (ADMIN only)
 * @route   POST /admin/create-user
 * @access  Private (ADMIN only)
 */
const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            role,
            clinicId,
            phone,
            specialization,
            qualification,
            experience,
            licenseNumber
        } = req.body;

        // Validate required fields
        if (!name || !email || !role || !clinicId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, role, and clinicId'
            });
        }

        // Validate role - cannot create ADMIN users
        if (role === 'ADMIN') {
            return res.status(400).json({
                success: false,
                message: 'Cannot create ADMIN users through this endpoint'
            });
        }

        if (!['DOCTOR', 'DIETITIAN'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be DOCTOR or DIETITIAN'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Validate clinic exists and is active
        const clinic = await Clinic.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({
                success: false,
                message: 'Clinic not found'
            });
        }

        if (!clinic.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Clinic is not active'
            });
        }

        // Generate unique username
        let username = generateUsername(name);
        let usernameExists = await User.findOne({ username });

        // Retry if username collision (very rare)
        let attempts = 0;
        while (usernameExists && attempts < 5) {
            username = generateUsername(name);
            usernameExists = await User.findOne({ username });
            attempts++;
        }

        if (usernameExists) {
            return res.status(500).json({
                success: false,
                message: 'Unable to generate unique username. Please try again.'
            });
        }

        // Generate secure password
        const temporaryPassword = generateSecurePassword();

        // Encrypt password for storage (so it can be retrieved later)
        const encryptedTempPassword = encryptPassword(temporaryPassword);

        // Create user
        const user = await User.create({
            name,
            email,
            username,
            password: temporaryPassword, // Will be hashed by pre-save hook
            encryptedTempPassword, // Store encrypted version for retrieval
            role,
            clinic: clinicId,
            phone: phone || '',
            specialization: specialization || '',
            qualification: qualification || '',
            experience: experience || 0,
            licenseNumber: licenseNumber || '',
            createdBy: req.user._id, // Current admin's ID
            isActive: true
        });

        // Populate clinic details for response
        await user.populate('clinic', 'name email phone');

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    phone: user.phone,
                    specialization: user.specialization,
                    qualification: user.qualification,
                    experience: user.experience,
                    licenseNumber: user.licenseNumber,
                    clinic: {
                        id: user.clinic._id,
                        name: user.clinic.name,
                        email: user.clinic.email,
                        phone: user.clinic.phone
                    },
                    createdBy: user.createdBy,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                },
                credentials: {
                    username: user.username,
                    temporaryPassword: temporaryPassword
                }
            },
            message: 'User created successfully. Share these credentials with the user.'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Delete a user (ADMIN only)
 * @route   DELETE /admin/user/:userId
 * @access  Private (ADMIN only)
 */
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting ADMIN users
        if (user.role === 'ADMIN') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete ADMIN users'
            });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get user credentials (decrypt password)
 * @route   GET /admin/user/:userId/credentials
 * @access  Private (ADMIN only)
 */
const getUserCredentials = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('+encryptedTempPassword');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.encryptedTempPassword) {
            return res.status(404).json({
                success: false,
                message: 'No stored credentials found for this user'
            });
        }

        // Decrypt the password
        const decryptedPassword = decryptPassword(user.encryptedTempPassword);

        res.status(200).json({
            success: true,
            data: {
                username: user.username,
                password: decryptedPassword,
                maskedUsername: maskString(user.username),
                maskedPassword: maskString(decryptedPassword)
            }
        });
    } catch (error) {
        console.error('Error retrieving credentials:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createUser,
    deleteUser,
    getUserCredentials
};
