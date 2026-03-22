const Clinic = require('../models/Clinic');
const User = require('../models/User');

/**
 * @desc    Create a new clinic (ADMIN only)
 * @route   POST /admin/create-clinic
 * @access  Private (ADMIN only)
 */
const createClinic = async (req, res) => {
    try {
        const { name, address, phone, email } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide clinic name'
            });
        }

        // Check if clinic with same name already exists
        const existingClinic = await Clinic.findOne({ name });
        if (existingClinic) {
            return res.status(400).json({
                success: false,
                message: 'Clinic with this name already exists'
            });
        }

        // Create clinic
        const clinic = await Clinic.create({
            name,
            address: address || '',
            phone: phone || '',
            email: email || '',
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: clinic,
            message: 'Clinic created successfully'
        });
    } catch (error) {
        console.error('Error creating clinic:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get all clinics (ADMIN only)
 * @route   GET /admin/clinics
 * @access  Private (ADMIN only)
 */
const getClinics = async (req, res) => {
    try {
        const [clinics, totalDoctors] = await Promise.all([
            Clinic.find().sort({ createdAt: -1 }),
            User.countDocuments({ role: 'DOCTOR', isActive: true })
        ]);

        res.status(200).json({
            success: true,
            count: clinics.length,
            totalDoctors,
            data: clinics
        });
    } catch (error) {
        console.error('Error fetching clinics:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get clinic details with all users
 * @route   GET /admin/clinic/:clinicId
 * @access  Private (ADMIN only)
 */
const getClinicDetail = async (req, res) => {
    try {
        const { clinicId } = req.params;

        const clinic = await Clinic.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({
                success: false,
                message: 'Clinic not found'
            });
        }

        // Get all users in this clinic
        const User = require('../models/User');
        const users = await User.find({ clinic: clinicId }).select('-password');

        res.status(200).json({
            success: true,
            data: {
                clinic,
                users
            }
        });
    } catch (error) {
        console.error('Error fetching clinic details:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Update clinic details
 * @route   PUT /admin/clinic/:clinicId
 * @access  Private (ADMIN only)
 */
const updateClinic = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const { name, address, phone, email } = req.body;

        const clinic = await Clinic.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({
                success: false,
                message: 'Clinic not found'
            });
        }

        // Update fields
        if (name) clinic.name = name;
        if (address !== undefined) clinic.address = address;
        if (phone !== undefined) clinic.phone = phone;
        if (email !== undefined) clinic.email = email;

        await clinic.save();

        res.status(200).json({
            success: true,
            data: clinic,
            message: 'Clinic updated successfully'
        });
    } catch (error) {
        console.error('Error updating clinic:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Delete clinic
 * @route   DELETE /admin/clinic/:clinicId
 * @access  Private (ADMIN only)
 */
const deleteClinic = async (req, res) => {
    try {
        const { clinicId } = req.params;

        const clinic = await Clinic.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({
                success: false,
                message: 'Clinic not found'
            });
        }

        // Check if clinic has users
        const User = require('../models/User');
        const userCount = await User.countDocuments({ clinic: clinicId });

        if (userCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete clinic. It has ${userCount} user(s). Please delete or reassign users first.`
            });
        }

        await Clinic.findByIdAndDelete(clinicId);

        res.status(200).json({
            success: true,
            message: 'Clinic deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting clinic:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createClinic,
    getClinics,
    getClinicDetail,
    updateClinic,
    deleteClinic
};
