const DietChart = require('../models/DietChart');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Food = require('../models/Food');
const { generateDietPlan, calculateTotalNutrition } = require('../utils/ayurvedaRules');
const { selectMealsWithGrok } = require('../utils/groqMealSelector');
const { logAudit } = require('../middleware/audit.middleware');

// @desc    Generate diet plan (Phase 3 - Doctor Workflow)
// @route   POST /api/diets/generate
// @access  Private
const generateDiet = async (req, res) => {
    try {
        const { visitId, prakriti, agni, doshaSeverity, season, dietPreference, doctorNotes } = req.body;

        // Validate required fields
        if (!visitId || !prakriti || !agni || !doshaSeverity || !dietPreference) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: visitId, prakriti, agni, doshaSeverity, dietPreference'
            });
        }

        // Get visit and verify access
        const visit = await Visit.findById(visitId).populate('patient');
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

        // Get curated (clinic-approved) foods only
        const allFoods = await Food.find({ isClinicApproved: true });
        if (allFoods.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No foods available in database'
            });
        }

        // Create temporary patient object with clinical parameters
        const clinicalPatient = {
            name: visit.patient.name,
            age: visit.patient.age,
            prakriti: prakriti,
            digestionStrength: agni,
            dietaryPreference: dietPreference,
            currentSeason: season || null
        };

        // Generate diet plan using Phase 2 engine
        let dietPlan;
        try {
            dietPlan = generateDietPlan(
                clinicalPatient,
                allFoods,
                doshaSeverity,
                season
            );
        } catch (error) {
            // Handle validation errors from Phase 2 engine
            if (error.message.startsWith('INVALID PLAN') ||
                error.message.startsWith('Unable to generate diet plan')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            throw error; // Re-throw unexpected errors
        }

        // ── AI ENHANCEMENT LAYER (Optional) ───────────────
        let finalBreakfast = dietPlan.breakfast;
        let finalSnackAM = dietPlan.midMorningSnack || [];
        let finalLunch = dietPlan.lunch;
        let finalSnackPM = dietPlan.eveningSnack || [];
        let finalDinner = dietPlan.dinner;
        let aiReasoning = null;
        let finalNutrition = dietPlan.totalNutrients;

        if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'PASTE_YOUR_GROQ_KEY_HERE') {
            const candidates = {
                breakfast: allFoods.filter(f => f.meal_type === 'Breakfast' || f.meal_type === 'All'),
                midMorningSnack: allFoods.filter(f => f.meal_type === 'Snack' || (f.meal_type === 'All' && ['Fruits and Fruit Juices', 'Nut and Seed Products', 'Vegetables and Vegetable Products'].includes(f.category))),
                lunch: allFoods.filter(f => f.meal_type === 'Lunch' || f.meal_type === 'All'),
                eveningSnack: allFoods.filter(f => f.meal_type === 'Snack' || (f.meal_type === 'All' && ['Fruits and Fruit Juices', 'Nut and Seed Products', 'Vegetables and Vegetable Products'].includes(f.category))),
                dinner: allFoods.filter(f => f.meal_type === 'Dinner' || f.meal_type === 'All')
            };

            const groqResult = await selectMealsWithGrok(clinicalPatient, candidates, season);

            if (groqResult) {
                const idToFood = {};
                allFoods.forEach(f => idToFood[f._id.toString()] = f);

                finalBreakfast = groqResult.breakfast.map(id => idToFood[id]).filter(Boolean);
                finalSnackAM = groqResult.midMorningSnack.map(id => idToFood[id]).filter(Boolean);
                finalLunch = groqResult.lunch.map(id => idToFood[id]).filter(Boolean);
                finalSnackPM = groqResult.eveningSnack.map(id => idToFood[id]).filter(Boolean);
                finalDinner = groqResult.dinner.map(id => idToFood[id]).filter(Boolean);
                aiReasoning = groqResult.reasoning;
                
                // Recalculate nutrition specifically for the newly AI-selected foods
                const allAISelectedFoods = [
                    ...finalBreakfast,
                    ...finalSnackAM,
                    ...finalLunch,
                    ...finalSnackPM,
                    ...finalDinner
                ];
                finalNutrition = calculateTotalNutrition(allAISelectedFoods);
            }
        }
        // ────────────────────────────────────────────────

        // Return successful diet plan
        return res.status(200).json({
            success: true,
            dietPlan: {
                breakfast: finalBreakfast.map(food => ({
                    foodItem: food,
                    quantity: '1 serving'
                })),
                midMorningSnack: finalSnackAM.map(food => ({
                    foodItem: food,
                    quantity: '1 serving'
                })),
                lunch: finalLunch.map(food => ({
                    foodItem: food,
                    quantity: '1 serving'
                })),
                eveningSnack: finalSnackPM.map(food => ({
                    foodItem: food,
                    quantity: '1 serving'
                })),
                dinner: finalDinner.map(food => ({
                    foodItem: food,
                    quantity: '1 serving'
                }))
            },
            totalNutrients: finalNutrition,
            ayurvedaAttributes: dietPlan.ayurvedaAttributes,
            complianceNotes: aiReasoning ? [...dietPlan.complianceNotes, `AI Reasoning: ${aiReasoning}`] : dietPlan.complianceNotes,
            severityWarnings: dietPlan.severityWarnings || [],
            rdaComparison: dietPlan.rdaComparison || null
        });

    } catch (error) {
        console.error('Error generating diet:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while generating diet',
            error: error.message
        });
    }
};

// @desc    Save diet chart with versioning (Phase 3)
// @route   POST /diet/api/save
// @access  Private
const saveDiet = async (req, res) => {
    try {
        console.log('\n=== SAVE DIET REQUEST ===');
        console.log('Payload:', JSON.stringify(req.body, null, 2));
        console.log('User:', req.user._id, 'Role:', req.user.role);

        const { visitId, dietPlan, doctorNotes, overrides } = req.body;

        // Validate required fields
        if (!visitId || !dietPlan) {
            console.error('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: visitId, dietPlan'
            });
        }

        console.log('✓ Fetching visit:', visitId);
        // Get visit and verify access
        const visit = await Visit.findById(visitId).populate('patient');
        if (!visit) {
            console.error('❌ Visit not found:', visitId);
            return res.status(404).json({
                success: false,
                message: 'Visit not found'
            });
        }
        console.log('✓ Visit found:', visit._id, 'Patient:', visit.patient.name);

        // Verify visit belongs to user's clinic
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();
        const visitClinicId = (visit.clinic._id || visit.clinic).toString();

        if (visitClinicId !== userClinicId) {
            console.error('❌ Clinic mismatch. User:', userClinicId, 'Visit:', visitClinicId);
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this visit'
            });
        }
        console.log('✓ Clinic verified:', userClinicId);

        // Find latest active diet chart for versioning
        const latestDiet = await DietChart.findOne({
            visit: visit._id,
            isActive: true
        }).sort({ version: -1 });

        // Mark previous version inactive if exists
        if (latestDiet) {
            console.log('✓ Deactivating previous version:', latestDiet.version);
            latestDiet.isActive = false;
            await latestDiet.save();
        }

        // Calculate new version number
        const newVersion = latestDiet ? latestDiet.version + 1 : 1;
        console.log('✓ New version:', newVersion);

        // Use totalNutrients from payload if available, otherwise use default
        const finalNutrition = dietPlan.totalNutrients || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        console.log('✓ Nutrition:', finalNutrition);

        // Format meals for storage (ensure only IDs are stored)
        const formatMeal = (mealItems) => {
            if (!mealItems || !Array.isArray(mealItems)) return [];
            return mealItems.map(item => ({
                foodItem: item.foodItem._id || item.foodItem,
                quantity: item.quantity || '1 serving'
            }));
        };

        const formattedBreakfast = formatMeal(dietPlan.breakfast || []);
        const formattedMidMorningSnack = formatMeal(dietPlan.midMorningSnack || []);
        const formattedLunch = formatMeal(dietPlan.lunch || []);
        const formattedEveningSnack = formatMeal(dietPlan.eveningSnack || []);
        const formattedDinner = formatMeal(dietPlan.dinner || []);

        console.log('✓ Formatted meals:', {
            breakfast: formattedBreakfast.length,
            midMorningSnack: formattedMidMorningSnack.length,
            lunch: formattedLunch.length,
            eveningSnack: formattedEveningSnack.length,
            dinner: formattedDinner.length
        });

        // Create new diet chart
        console.log('✓ Creating diet chart...');
        const dietChart = await DietChart.create({
            visit: visit._id,
            patient: visit.patient._id,
            clinic: visit.clinic,
            version: newVersion,
            isActive: true,
            breakfast: formattedBreakfast,
            midMorningSnack: formattedMidMorningSnack,
            lunch: formattedLunch,
            eveningSnack: formattedEveningSnack,
            dinner: formattedDinner,
            totalNutrients: finalNutrition,
            ayurvedaAttributes: dietPlan.ayurvedaAttributes || {},
            complianceNotes: dietPlan.complianceNotes || [],
            doctorNotes: doctorNotes || '',
            isManuallyModified: overrides && overrides.length > 0,
            manualOverrides: overrides || [],
            createdBy: req.user._id
        });

        console.log('✅ Diet chart saved successfully:', dietChart._id, 'Version:', dietChart.version);

        // Log audit entry
        await logAudit(req, 'DietChart', dietChart._id, 'create', {
            version: { old: null, new: dietChart.version },
            hasOverrides: { old: null, new: dietChart.isManuallyModified }
        });

        return res.status(200).json({
            success: true,
            dietChart: {
                _id: dietChart._id,
                version: dietChart.version,
                isActive: dietChart.isActive
            }
        });

    } catch (error) {
        console.error('\n❌ SAVE DIET ERROR:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('Name:', error.name);

        return res.status(500).json({
            success: false,
            message: 'Server error while saving diet',
            error: error.message,
            details: error.name
        });
    }
};


// @desc    Generate diet chart for a patient (Legacy - Phase 1/2)
// @route   POST /diet/generate
// @access  Private
const generateDietChart = async (req, res) => {
    try {
        const { patientId, visitId } = req.body;

        if (!visitId && !patientId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide either visitId or patientId'
            });
        }

        let visit;
        let patient;
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();

        if (visitId) {
            // Use existing visit
            visit = await Visit.findById(visitId).populate('patient');
            if (!visit) {
                return res.status(404).json({ success: false, message: 'Visit not found' });
            }
            const visitClinicId = (visit.clinic._id || visit.clinic).toString();
            if (visitClinicId !== userClinicId) {
                return res.status(403).json({ success: false, message: 'Not authorized to access this visit' });
            }
            patient = visit.patient;
        } else {
            // patientId path — validate patient first, but do NOT create visit yet
            patient = await Patient.findById(patientId);
            if (!patient) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }
            const patientClinicId = (patient.clinic._id || patient.clinic).toString();
            if (patientClinicId !== userClinicId) {
                return res.status(403).json({ success: false, message: 'Not authorized to generate diet for this patient' });
            }
        }

        // ── Check food availability BEFORE creating anything ──────────────────────
        // This prevents orphan visits being created when the food DB is empty
        const allFoods = await Food.find({ isClinicApproved: true });
        if (allFoods.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No foods available in database. Please add foods first.'
            });
        }

        // ── Attempt diet plan generation BEFORE committing visit to DB ────────────
        const severity = (visit && visit.doshaImbalanceSeverity) || 'Moderate';
        const season = patient.currentSeason || null;

        // Populate conditions for condition-based filtering (Fix 3)
        let populatedConditions = [];
        if (patient.conditions && patient.conditions.length > 0) {
            try {
                const Condition = require('../models/Condition');
                const conditionIds = patient.conditions.map(c => c._id || c);
                populatedConditions = await Condition.find({ _id: { $in: conditionIds } });
            } catch (_) { /* non-critical — proceed without condition filtering */ }
        }

        let dietPlan;
        try {
            dietPlan = generateDietPlan(patient, allFoods, severity, season, populatedConditions);
        } catch (error) {
            // Diet engine failed — nothing has been written to DB yet
            if (error.message.startsWith('INVALID PLAN')) {
                return res.status(400).json({
                    success: false,
                    message: 'Unable to generate a valid diet plan with current food database.',
                    details: error.message,
                    type: 'RULE_VIOLATION',
                    suggestion: 'Add more food items with different Virya (warming/cooling) and Rasa (taste) profiles.'
                });
            }
            if (error.message.startsWith('Unable to generate diet plan')) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient food variety in database',
                    details: error.message,
                    type: 'INSUFFICIENT_VARIETY',
                    suggestion: 'Add foods with both Ushna (warming) and Sheeta (cooling) properties.'
                });
            }
            throw error;
        }

        // ── Diet plan is valid — now safe to auto-create visit if needed ──────────
        let autoCreatedVisit = false;
        if (!visitId) {
            visit = await Visit.create({
                patient: patientId,
                clinic: req.user.clinic._id || req.user.clinic,
                conductedBy: req.user._id,
                visitDate: new Date(),
                chiefComplaint: 'Auto-generated for diet chart',
                notes: 'Created automatically via Quick Generate'
            });
            autoCreatedVisit = true;
        }

        // ── Persist diet chart ────────────────────────────────────────────────────
        const formatMeal = (foods) => foods.map(food => ({
            foodItem: food._id,
            quantity: '1 serving'
        }));

        const latestDiet = await DietChart.findOne({ visit: visit._id, isActive: true }).sort({ version: -1 });
        if (latestDiet) {
            latestDiet.isActive = false;
            await latestDiet.save();
        }
        const newVersion = latestDiet ? latestDiet.version + 1 : 1;

        const dietChart = await DietChart.create({
            visit: visit._id,
            patient: patient._id,
            clinic: req.user.clinic._id || req.user.clinic,
            version: newVersion,
            isActive: true,
            breakfast: formatMeal(dietPlan.breakfast),
            lunch: formatMeal(dietPlan.lunch),
            dinner: formatMeal(dietPlan.dinner),
            totalNutrients: dietPlan.totalNutrients,
            ayurvedaAttributes: dietPlan.ayurvedaAttributes,
            complianceNotes: dietPlan.complianceNotes,
            createdBy: req.user._id
        });

        await dietChart.populate('breakfast.foodItem lunch.foodItem dinner.foodItem patient visit');

        console.log(`[Diet] Generated diet chart ${dietChart._id} for visit ${visit._id} (autoCreated=${autoCreatedVisit})`);

        res.status(201).json({
            success: true,
            data: dietChart,
            meta: {
                version: newVersion,
                previousVersion: latestDiet ? latestDiet.version : null,
                visitId: visit._id,
                autoCreatedVisit
            }
        });
    } catch (error) {
        console.error('[Diet] generateDietChart error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get diet chart for a patient (latest active)
// @route   GET /diet/:patientId
// @access  Private
const getDietChart = async (req, res) => {
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

        // Find the most recent active diet chart for the patient
        const dietChart = await DietChart.findOne({
            patient: patientId,
            clinic: req.user.clinic._id || req.user.clinic,
            isActive: true
        })
            .sort({ createdAt: -1 })
            .populate('breakfast.foodItem midMorningSnack.foodItem lunch.foodItem eveningSnack.foodItem dinner.foodItem patient visit');

        if (!dietChart) {
            return res.status(404).json({
                success: false,
                message: 'No active diet chart found for this patient'
            });
        }

        res.status(200).json({
            success: true,
            data: dietChart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get diet chart by visit ID
// @route   GET /diet/visit/:visitId
// @access  Private
const getDietChartByVisit = async (req, res) => {
    try {
        const { visitId } = req.params;

        // Verify visit belongs to user's clinic
        const visit = await Visit.findById(visitId);

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

        // Find active diet chart for this visit
        const dietChart = await DietChart.findOne({
            visit: visitId,
            isActive: true
        })
            .populate('breakfast.foodItem midMorningSnack.foodItem lunch.foodItem eveningSnack.foodItem dinner.foodItem patient visit');

        if (!dietChart) {
            return res.status(404).json({
                success: false,
                message: 'No active diet chart found for this visit'
            });
        }

        res.status(200).json({
            success: true,
            data: dietChart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all diet chart versions for a visit
// @route   GET /diet/visit/:visitId/history
// @access  Private
const getDietChartHistory = async (req, res) => {
    try {
        const { visitId } = req.params;

        // Verify visit belongs to user's clinic
        const visit = await Visit.findById(visitId);

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

        // Get all versions sorted by version number (newest first)
        const dietCharts = await DietChart.find({
            visit: visitId
        })
            .sort({ version: -1 })
            .populate('breakfast.foodItem midMorningSnack.foodItem lunch.foodItem eveningSnack.foodItem dinner.foodItem')
            .populate('patient', 'name email age gender prakriti digestionStrength dietaryPreference')
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            count: dietCharts.length,
            data: dietCharts
        });
    } catch (error) {
        console.error('Error saving diet:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while saving diet',
            error: error.message
        });
    }
};

// @desc    Get a single diet chart by its own _id (for Edit page load)
// @route   GET /diet/api/chart/:dietChartId
// @access  Private
const getDietChartById = async (req, res) => {
    try {
        const { dietChartId } = req.params;
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();

        const dietChart = await DietChart.findById(dietChartId)
            .populate('breakfast.foodItem midMorningSnack.foodItem lunch.foodItem eveningSnack.foodItem dinner.foodItem')
            .populate('patient', 'name age gender prakriti digestionStrength dietaryPreference')
            .populate('visit');

        if (!dietChart) {
            return res.status(404).json({ success: false, message: 'Diet chart not found' });
        }

        // Clinic ownership check
        const chartClinicId = (dietChart.clinic._id || dietChart.clinic).toString();
        if (chartClinicId !== userClinicId) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this diet chart' });
        }

        return res.status(200).json({ success: true, data: dietChart });
    } catch (error) {
        console.error('Error fetching diet chart by id:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PUT /diet/api/:dietChartId/edit
// @access  Private (Doctor, Dietitian)
const editDiet = async (req, res) => {
    try {
        const { dietChartId } = req.params;
        const { breakfast, midMorningSnack, lunch, eveningSnack, dinner, editNotes } = req.body;
        const userClinicId = (req.user.clinic._id || req.user.clinic).toString();

        const dietChart = await DietChart.findById(dietChartId);
        if (!dietChart) {
            return res.status(404).json({ success: false, message: 'Diet chart not found' });
        }

        // Clinic ownership check
        const chartClinicId = (dietChart.clinic._id || dietChart.clinic).toString();
        if (chartClinicId !== userClinicId) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this diet chart' });
        }

        // Collect all food IDs from all 5 meal slots
        const allMealItems = [
            ...(breakfast || []),
            ...(midMorningSnack || []),
            ...(lunch || []),
            ...(eveningSnack || []),
            ...(dinner || [])
        ];
        const foodIds = allMealItems.map(item => item.foodItem);
        const foodDocs = await Food.find({ _id: { $in: foodIds } });
        const foodMap = {};
        foodDocs.forEach(f => { foodMap[f._id.toString()] = f; });

        // Recompute totalNutrients server-side (100g portions assumed)
        const microKeys = ['iron', 'calcium', 'vitaminC', 'vitaminD', 'vitaminB12', 'zinc', 'magnesium', 'omega3', 'folate', 'potassium', 'sodium'];
        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        microKeys.forEach(k => { totals[k] = 0; });

        allMealItems.forEach(item => {
            const f = foodMap[item.foodItem?.toString()];
            if (!f) return;
            const mult = (item.portionSize || 100) / 100;
            totals.calories += (f.energy || 0) * mult;
            totals.protein += (f.protein || 0) * mult;
            totals.carbs += (f.carbs || 0) * mult;
            totals.fat += (f.fat || 0) * mult;
            totals.fiber += (f.fiber || 0) * mult;
            microKeys.forEach(k => { totals[k] += (f[k] || 0) * mult; });
        });

        // Round all to 2dp
        Object.keys(totals).forEach(k => { totals[k] = Math.round(totals[k] * 100) / 100; });

        // Format a meal array for saving (normalize foodItem to ObjectId string)
        const fmt = (arr) => (arr || []).map(item => ({
            foodItem: item.foodItem,
            quantity: item.quantity || '1 serving',
            ...(item.portionSize !== undefined && { portionSize: item.portionSize })
        }));

        // Update in place — no version bump (edit ≠ regeneration)
        dietChart.breakfast = fmt(breakfast);
        dietChart.midMorningSnack = fmt(midMorningSnack);
        dietChart.lunch = fmt(lunch);
        dietChart.eveningSnack = fmt(eveningSnack);
        dietChart.dinner = fmt(dinner);
        dietChart.totalNutrients = totals;
        if (editNotes !== undefined) dietChart.doctorNotes = editNotes;
        dietChart.updatedBy = req.user._id;

        await dietChart.save();

        const populated = await DietChart.findById(dietChart._id)
            .populate('breakfast.foodItem midMorningSnack.foodItem lunch.foodItem eveningSnack.foodItem dinner.foodItem');

        return res.status(200).json({ success: true, dietChart: populated });
    } catch (error) {
        console.error('Error editing diet chart:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    generateDiet,
    saveDiet,
    generateDietChart,
    getDietChart,
    getDietChartById,
    getDietChartByVisit,
    getDietChartHistory,
    editDiet
};
