const Patient = require('../models/Patient');
const { logAudit } = require('../middleware/audit.middleware');

// @desc    Create a new patient
// @route   POST /patients
// @access  Private
const createPatient = async (req, res) => {
    try {
        const { name, age, gender, prakriti, dietaryPreference, digestionStrength, waterIntake, bowelMovement, weight, height, activityLevel } = req.body;

        // Validate required fields
        if (!name || !age || !gender || !prakriti || !dietaryPreference || !digestionStrength || waterIntake === undefined || !bowelMovement) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // CRITICAL: Check if user has a clinic assigned
        if (!req.user.clinic) {
            return res.status(400).json({
                success: false,
                message: 'User account does not have a clinic assigned. Please logout and re-register.'
            });
        }

        // Create patient
        const patient = await Patient.create({
            name,
            age,
            gender,
            prakriti,
            dietaryPreference,
            digestionStrength,
            waterIntake,
            bowelMovement,
            ...(weight !== undefined && { weight }),
            ...(height !== undefined && { height }),
            ...(activityLevel !== undefined && { activityLevel }),
            // Handle both populated and unpopulated clinic
            clinic: req.user.clinic._id || req.user.clinic,
            createdBy: req.user._id
        });

        // Log audit entry
        await logAudit(req, 'Patient', patient._id, 'create');

        res.status(201).json({
            success: true,
            data: patient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all patients for logged-in doctor
// @route   GET /patients?search=query
// @access  Private
const getAllPatients = async (req, res) => {
    try {
        // CRITICAL: Check if user has a clinic assigned
        if (!req.user.clinic) {
            return res.status(400).json({
                success: false,
                message: 'User account does not have a clinic assigned. Please logout and re-register.'
            });
        }

        // Build query
        const query = {
            clinic: req.user.clinic._id || req.user.clinic
        };

        // Add search if provided
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        // Filter by user's clinic for data isolation
        const patients = await Patient.find(query)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            data: patients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get patient by ID
// @route   GET /patients/:id
// @access  Private
const getPatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('clinic', 'name');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient belongs to the same clinic
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();
        const patientClinicId = (patient.clinic._id || patient.clinic).toString();

        if (patientClinicId !== userClinicId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this patient'
            });
        }

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update patient
// @route   PUT /patients/:id
// @access  Private
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Verify ownership
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();
        const patientClinicId = (patient.clinic._id || patient.clinic).toString();
        if (patientClinicId !== userClinicId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this patient' });
        }

        const allowedFields = ['name', 'age', 'gender', 'prakriti', 'dietaryPreference', 'digestionStrength',
            'waterIntake', 'bowelMovement', 'weight', 'height', 'activityLevel', 'currentSeason'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) patient[field] = req.body[field];
        });

        await patient.save();
        await logAudit(req, 'Patient', patient._id, 'update');

        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete patient
// @route   DELETE /patients/:id
// @access  Private
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Verify ownership
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();
        const patientClinicId = (patient.clinic._id || patient.clinic).toString();
        if (patientClinicId !== userClinicId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this patient' });
        }

        await patient.deleteOne();
        await logAudit(req, 'Patient', req.params.id, 'delete');

        res.status(200).json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createPatient,
    getAllPatients,
    getPatient,
    updatePatient,
    deletePatient
};
