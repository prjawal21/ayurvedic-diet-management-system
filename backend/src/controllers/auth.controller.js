const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Clinic = require('../models/Clinic');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// PUBLIC REGISTRATION DISABLED
// Users must be created by admin via /admin/create-user endpoint
/*
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Implement Rule 1: Atomic clinic check and creation
        let clinic = await Clinic.findOne();
        if (!clinic) {
            clinic = await Clinic.create({
                name: 'Default Clinic',
                isActive: true
            });
        }

        // Create user with clinic association
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'DOCTOR',  // Default to DOCTOR if not specified
            clinic: clinic._id
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                clinic: {
                    id: clinic._id,
                    name: clinic.name
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
*/


// @desc    Login user
// @route   POST /auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Validate input - accept either email or username
        if ((!email && !username) || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/username and password'
            });
        }

        // Find user by email or username, include password field, populate clinic
        const query = email ? { email } : { username };
        const user = await User.findOne(query)
            .select('+password')
            .populate('clinic', 'name email phone');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User account is inactive'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                clinic: user.clinic ? {
                    id: user.clinic._id,
                    name: user.clinic.name,
                    email: user.clinic.email,
                    phone: user.clinic.phone
                } : null,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    login
};
