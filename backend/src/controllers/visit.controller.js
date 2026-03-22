const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const { logAudit } = require('../middleware/audit.middleware');

// @desc    Create a new visit
// @route   POST /visits
// @access  Private (DOCTOR, DIETITIAN only - enforced by route middleware)
const createVisit = async (req, res) => {
    try {
        const { patientId, visitDate, chiefComplaint, notes } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide patient ID'
            });
        }

        // Verify patient exists and belongs to user's clinic
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient belongs to user's clinic
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();
        const patientClinicId = (patient.clinic._id || patient.clinic).toString();

        if (patientClinicId !== userClinicId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create visit for this patient'
            });
        }

        // Create visit
        const visit = await Visit.create({
            patient: patientId,
            clinic: req.user.clinic._id || req.user.clinic,
            conductedBy: req.user._id,
            visitDate: visitDate || new Date(),
            chiefComplaint: chiefComplaint || '',
            notes: notes || ''
        });

        // Populate fields for response
        await visit.populate('patient', 'name age gender prakriti');
        await visit.populate('conductedBy', 'name email role');

        // Log audit entry
        await logAudit(req, 'Visit', visit._id, 'create');

        res.status(201).json({
            success: true,
            data: visit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all visits for a patient
// @route   GET /visits/patient/:patientId
// @access  Private
const getPatientVisits = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Verify patient belongs to user's clinic
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient belongs to user's clinic
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();
        const patientClinicId = (patient.clinic._id || patient.clinic).toString();

        if (patientClinicId !== userClinicId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this patient'
            });
        }

        // Get all visits for the patient
        const visits = await Visit.find({
            patient: patientId,
            clinic: req.user.clinic._id || req.user.clinic
        })
            .sort({ visitDate: -1 })
            .populate('conductedBy', 'name email role');

        res.status(200).json({
            success: true,
            data: visits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single visit by ID
// @route   GET /visits/:id
// @access  Private
const getVisit = async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.id)
            .populate('patient', 'name age gender prakriti')
            .populate('conductedBy', 'name email role')
            .populate('clinic', 'name');

        if (!visit) {
            return res.status(404).json({
                success: false,
                message: 'Visit not found'
            });
        }

        // Verify visit belongs to user's clinic
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();
        const visitClinicId = (visit.clinic._id || visit.clinic).toString();

        if (visitClinicId !== userClinicId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this visit'
            });
        }

        res.status(200).json({
            success: true,
            data: visit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all visits for a patient (Phase 3)
// @route   GET /api/visits/patient/:patientId
// @access  Private
const getVisitsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Verify patient exists and belongs to user's clinic
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Verify patient belongs to user's clinic
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();
        const patientClinicId = (patient.clinic._id || patient.clinic).toString();

        if (patientClinicId !== userClinicId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this patient'
            });
        }

        // Get all visits for patient
        const visits = await Visit.find({
            patient: patientId,
            clinic: req.user.clinic._id || req.user.clinic
        })
            .sort({ visitDate: -1 })
            .populate('conductedBy', 'name email');

        res.status(200).json({
            success: true,
            data: visits
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createVisit,
    getPatientVisits,
    getVisit,
    getVisitsByPatient
};
