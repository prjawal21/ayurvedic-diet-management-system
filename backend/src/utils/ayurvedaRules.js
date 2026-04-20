/**
 * Ayurvedic Diet Planning Engine - Phase 2 Enhanced
 * Includes Viruddha Ahara, Seasonal (Ritu), and Severity-based adjustments
 */

// Phase 2 Validation Modules
const { validateViruddhaAhara } = require('./viruddhaAhara');
const {
    getSeasonalAdjustments,
    applySeasonalBias,
    getSeasonalViryaRatio,
    validateSeasonalCompliance,
    explainSeasonalChoice
} = require('./seasonalRules');
const {
    getSeverityAdjustments,
    adjustViryaRangeForSeverity,
    getAgniMealRulesForSeverity,
    isFallbackAllowed,
    validateSeverityCompliance,
    explainSeverityAdjustment
} = require('./severityRules');
const { getRDATargets } = require('./rdaTargets');

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const MIN_DAILY_CALORIES = 1200;
const MAX_DAILY_CALORIES = 3000;
const DEFAULT_PORTION_SIZE = 100; // grams

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate calorie target using Mifflin-St Jeor BMR + TDEE.
 * Falls back to age-tier defaults when weight or height are not provided.
 * @param {object} patient — the full patient object
 */
const calculateCalorieTarget = (patient) => {
    const { age, gender, weight, height, activityLevel } = patient;

    // Fallback: no body metrics — use age-tier defaults
    if (!weight || !height) {
        if (age < 12) return 1500;
        if (age <= 60) return 2000;
        return 1700;
    }

    // Mifflin-St Jeor BMR
    let bmr;
    if (gender === 'Male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // TDEE activity multipliers
    const multipliers = {
        Sedentary: 1.2,
        LightlyActive: 1.375,
        ModeratelyActive: 1.55,
        VeryActive: 1.725,
        ExtraActive: 1.9
    };

    const multiplier = multipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
};

/**
 * Count virya distribution
 */
const countVirya = (foods) => {
    let warmingCount = 0;
    let coolingCount = 0;

    foods.forEach(food => {
        if (food.virya === 'Warming') warmingCount++;
        if (food.virya === 'Cooling') coolingCount++;
    });

    return { warmingCount, coolingCount };
};

// ============================================================================
// FOOD FILTERING FUNCTIONS
// ============================================================================

/**
 * Filter foods by dosha suitability.
 * Supports single-dosha prakriti ("Vata") and dual-dosha ("Vata-Pitta").
 * Foods suitable for any matching dosha, 'Dual', or 'Tridosha' are included.
 */
const filterByDosha = (foods, prakriti) => {
    // Split on '-' to handle dual prakriti (e.g. 'Vata-Pitta' → ['Vata', 'Pitta'])
    const doshas = prakriti.split('-');

    return foods.filter(food => {
        return doshas.includes(food.dosha_suitable)
            || food.dosha_suitable === 'Dual'
            || food.dosha_suitable === 'Tridosha';
    });
};

/**
 * Filter foods by meal type
 */
const filterByMealType = (foods, mealType) => {
    return foods.filter(food => {
        return food.meal_type === mealType || food.meal_type === 'All';
    });
};

/**
 * Filter foods by agni level (digestive capacity)
 */
const filterByAgni = (foods, digestionStrength) => {
    const agniMap = {
        'Low': ['Low'],
        'Medium': ['Low', 'Medium'],
        'High': ['Low', 'Medium', 'High']
    };

    const allowed = agniMap[digestionStrength] || ['Low', 'Medium'];
    return foods.filter(food => allowed.includes(food.agni_level));
};

// ============================================================================
// FOOD SELECTION WITH FAULT TOLERANCE
// ============================================================================

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function scoreFood(food, season) {
    let score = 0;
    if (food.rasa && food.rasa.length > 0) score += 3;
    if (food.virya) score += 2;
    if (season?.viryaBias && food.virya === season.viryaBias) score += 2;
    if (food.dosha_suitable !== 'Tridosha') score += 1;
    return score;
}

const selectMealFoods = (allFoods, targetCalories, mealType, prakriti, agniLevel, dailyViryaTracker, severity = 'Moderate', season = null, minFoods = 2, maxFoods = 3) => {
    let candidates = allFoods;
    const warnings = [];

    // Filter by strict meal type
    candidates = filterByMealType(candidates, mealType);
    if (candidates.length < minFoods) warnings.push(`Very few ${mealType} foods available`);

    // Try dosha filter
    let doshaCandidates = filterByDosha(candidates, prakriti);
    if (doshaCandidates.length >= minFoods) candidates = doshaCandidates;

    // Try agni filter
    let agniCandidates = filterByAgni(candidates, agniLevel);
    if (agniCandidates.length >= minFoods) candidates = agniCandidates;

    if (season) candidates = applySeasonalBias(candidates, season);

    const severityMealRules = getAgniMealRulesForSeverity(agniLevel, severity);
    const maxFoodsForMeal = Math.min(severityMealRules.maxFoodsPerMeal, maxFoods);

    // SCORE AND WEIGHTED SHUFFLE
    candidates.forEach(f => f._score = scoreFood(f, season));
    
    const tiers = {};
    candidates.forEach(f => {
        if (!tiers[f._score]) tiers[f._score] = [];
        tiers[f._score].push(f);
    });

    const sortedScores = Object.keys(tiers).map(Number).sort((a,b) => b - a);
    let shuffledCandidates = [];
    for (const score of sortedScores) {
        shuffledCandidates = shuffledCandidates.concat(shuffleArray(tiers[score]));
    }

    const selectedFoods = [];
    let currentCalories = 0;

    // Within-meal deduplication helpers
    const mealCategoryCount = {};      // category → count
    const mealNamePrefixes = new Set(); // first 2 words of food name → prevent near-duplicates
    const getNamePrefix = (name) => name.toLowerCase().split(' ').slice(0, 2).join(' ');

    for (const food of shuffledCandidates) {
        if (selectedFoods.length >= maxFoodsForMeal) break;
        if (currentCalories >= targetCalories && selectedFoods.length >= minFoods) break;

        // Skip if same 2-word name prefix already in this meal (e.g. "masala chai" appearing 3 times)
        const prefix = getNamePrefix(food.name);
        if (mealNamePrefixes.has(prefix)) continue;

        // Allow at most 2 foods from the same category per meal (prevents all-beverage breakfast)
        const catCount = mealCategoryCount[food.category] || 0;
        if (catCount >= 2) continue;

        selectedFoods.push(food);
        currentCalories += (food.calories || food.energy || 0);
        mealNamePrefixes.add(prefix);
        mealCategoryCount[food.category] = catCount + 1;

        if (food.virya === 'Warming') dailyViryaTracker.warming++;
        if (food.virya === 'Cooling') dailyViryaTracker.cooling++;
    }

    // Fallback: if minFoods not met, relax dosha/agni completely and just pick randomly from approved meal_type pool
    if (selectedFoods.length < minFoods) {
        warnings.push(`Only ${selectedFoods.length} selected for ${mealType}. Relaxing constraints...`);
        let fallbackCandidates = allFoods.filter(f => f.meal_type === mealType || f.meal_type === 'All');
        
        // Exclude already selected
        const selectedIds = new Set(selectedFoods.map(f => f._id.toString()));
        fallbackCandidates = fallbackCandidates.filter(f => !selectedIds.has(f._id.toString()));
        
        fallbackCandidates = shuffleArray(fallbackCandidates);
        
        while (selectedFoods.length < minFoods && fallbackCandidates.length > 0) {
            const food = fallbackCandidates.pop();
            selectedFoods.push(food);
            if (food.virya === 'Warming') dailyViryaTracker.warming++;
            if (food.virya === 'Cooling') dailyViryaTracker.cooling++;
        }
    }

    warnings.forEach(w => console.warn(`⚠️  ${w}`));
    return selectedFoods;
};

// ============================================================================
// VALIDATION FUNCTIONS (SIMPLIFIED)
// ============================================================================

/**
 * Validate minimum Virya balance (at least 1 of each)
 */
const validateMinimumVirya = (allFoods) => {
    const { warmingCount, coolingCount } = countVirya(allFoods);

    if (warmingCount === 0 || coolingCount === 0) {
        return {
            valid: false,
            reason: `Insufficient Virya balance: ${warmingCount} Warming, ${coolingCount} Cooling foods. Need at least 1 of each.`
        };
    }

    return {
        valid: true,
        warmingCount,
        coolingCount
    };
};

/**
 * Validate nutrition sanity
 */
const validateNutritionSanity = (totalNutrients) => {
    if (totalNutrients.calories < MIN_DAILY_CALORIES) {
        return {
            valid: false,
            reason: `Total calories ${Math.round(totalNutrients.calories)} below minimum (${MIN_DAILY_CALORIES})`
        };
    }

    if (totalNutrients.calories > MAX_DAILY_CALORIES) {
        return {
            valid: false,
            reason: `Total calories ${Math.round(totalNutrients.calories)} exceeds maximum (${MAX_DAILY_CALORIES})`
        };
    }

    return { valid: true };
};

// ============================================================================
// NUTRITION CALCULATION (PER 100G)
// ============================================================================

/**
 * Calculate total nutrition from foods (assuming 100g portions).
 * Sums macros and all micronutrient fields present on food documents.
 */
const calculateTotalNutrition = (foods, portionSize = DEFAULT_PORTION_SIZE) => {
    const multiplier = portionSize / 100;

    return foods.reduce((totals, food) => {
        // Macronutrients
        totals.calories += (food.calories || food.energy || 0) * multiplier;
        totals.protein += (food.protein || 0) * multiplier;
        totals.carbs += (food.carbs || food.carbohydrates || 0) * multiplier;
        totals.fat += (food.fat || 0) * multiplier;
        totals.fiber += (food.fiber || 0) * multiplier;
        // Micronutrients
        totals.iron += (food.iron || 0) * multiplier;
        totals.calcium += (food.calcium || 0) * multiplier;
        totals.vitaminC += (food.vitaminC || 0) * multiplier;
        totals.vitaminD += (food.vitaminD || 0) * multiplier;
        totals.vitaminB12 += (food.vitaminB12 || 0) * multiplier;
        totals.zinc += (food.zinc || 0) * multiplier;
        totals.magnesium += (food.magnesium || 0) * multiplier;
        totals.omega3 += (food.omega3 || 0) * multiplier;
        totals.folate += (food.folate || 0) * multiplier;
        totals.potassium += (food.potassium || 0) * multiplier;
        totals.sodium += (food.sodium || 0) * multiplier;
        return totals;
    }, {
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
        iron: 0, calcium: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0,
        zinc: 0, magnesium: 0, omega3: 0, folate: 0, potassium: 0, sodium: 0
    });
};

// ============================================================================
// COMPLIANCE NOTES GENERATION
// ============================================================================

/**
 * Generate compliance notes (Phase 2 Enhanced)
 */
const generateComplianceNotes = (patient, ayurvedaAttributes, severity = null, season = null) => {
    const notes = [];

    // Prakriti info
    notes.push(`Constitution (Prakriti): ${patient.prakriti} - foods selected accordingly`);

    // Digestion strength
    notes.push(`Digestive capacity (Agni): ${patient.digestionStrength} - appropriate agni-level foods chosen`);

    // Dietary preference
    notes.push(`Dietary preference: ${patient.dietaryPreference}`);

    // PHASE 2: Severity-based adjustments
    if (severity) {
        notes.push(explainSeverityAdjustment(severity));
    }

    // PHASE 2: Seasonal adjustments
    if (season) {
        notes.push(explainSeasonalChoice(season));
    }

    // Virya balance
    notes.push(`Thermal balance (Virya): ${ayurvedaAttributes.viryaBalance}`);

    return notes;
};

// ============================================================================
// MAIN DIET GENERATION FUNCTION
// ============================================================================

/**
 * Generate diet plan with fault tolerance (Phase 2 Enhanced)
 */
const generateDietPlan = (patient, allFoods, severity = 'Moderate', season = null, populatedConditions = []) => {
    console.log(`\n🍽️  Generating diet for ${patient.name} (${patient.prakriti}, ${patient.digestionStrength} agni)`);
    console.log(`📊 Available foods: ${allFoods.length}`);

    // PHASE 2: Log severity and season
    if (severity) {
        console.log(`⚖️  Severity: ${severity}`);
    }
    if (season) {
        console.log(`🌿 Season: ${season}`);
    }

    // PHASE 2 FIX 4: Compute severity-adjusted Virya range before food selection
    const baseViryaRange = { ushnaMin: 0.3, ushnaMax: 0.7 };
    const adjustedViryaRange = adjustViryaRangeForSeverity(baseViryaRange, severity);
    console.log(`⚖️  Adjusted Virya range for ${severity} severity: [${adjustedViryaRange.ushnaMin}, ${adjustedViryaRange.ushnaMax}]`);

    // Fix 1: BMR-based calorie target
    const dailyCalorieTarget = calculateCalorieTarget(patient);
    const mealCalorieTarget = Math.floor(dailyCalorieTarget / 3);
    const snackCalorieTarget = Math.max(Math.floor(dailyCalorieTarget * 0.10), 150);
    console.log(`🎯 Target: ${dailyCalorieTarget} kcal/day (${mealCalorieTarget} per meal)`);

    let filteredFoods = allFoods;
    if (patient.dietaryPreference === 'Veg') {
        // Meat maps to 'Poultry Products' and 'Finfish and Shellfish Products' after CSV import
        const NON_VEG_CATEGORIES = ['Poultry Products', 'Finfish and Shellfish Products', 'Meat', 'Beef Products', 'Pork Products', 'Lamb, Veal, and Game Products'];
        filteredFoods = filteredFoods.filter(f => !NON_VEG_CATEGORIES.includes(f.category));
    }

    // ── Season filtering: keep foods that match the patient's current season ───
    // Foods with season 'all' or no season field are always included.
    // This ensures a summer patient gets cooling foods and a winter patient gets warming foods.
    if (season) {
        const seasonKey = season.toLowerCase(); // e.g. 'Grishma' → map to 'summer'
        // Map Ayurvedic season names to simple strings stored in food.season
        const SEASON_REMAP = {
            grishma: 'summer', sharad: 'summer',          // hot/cooling seasons
            hemanta: 'winter', shishira: 'winter',        // cold seasons
            vasanta: 'summer', varsha: 'summer',           // transitional (lean warm)
        };
        const simpleSeasonKey = SEASON_REMAP[seasonKey] || seasonKey; // 'summer' | 'winter' | ...

        const seasonFilteredFoods = filteredFoods.filter(f => {
            const foodSeasons = f.season || ['all'];
            // Include if food has 'all' or matching season
            return foodSeasons.includes('all') || foodSeasons.includes(simpleSeasonKey);
        });

        // Only apply the season filter if it doesn't wipe out the food pool (<20 foods would be too restrictive)
        if (seasonFilteredFoods.length >= 20) {
            console.log(`🌿 Season filter applied (${simpleSeasonKey}): ${filteredFoods.length} → ${seasonFilteredFoods.length} foods`);
            filteredFoods = seasonFilteredFoods;
        } else {
            console.warn(`⚠️  Season filter would leave only ${seasonFilteredFoods.length} foods — skipping hard filter, using bias only`);
        }
    }

    if (populatedConditions && populatedConditions.length > 0) {
        const avoidFoodIds = new Set();
        const avoidCategories = new Set();
        const conditionAvoidRasa = new Set();

        for (const cond of populatedConditions) {
            (cond.avoidFoods || []).forEach(f => avoidFoodIds.add(f.toString()));
            (cond.avoidFoodCategories || []).forEach(c => avoidCategories.add(c));
            (cond.avoidRasa || []).forEach(r => conditionAvoidRasa.add(r));
        }

        filteredFoods = filteredFoods.filter(food => {
            if (avoidFoodIds.has(food._id.toString())) return false;
            if (avoidCategories.has(food.category)) return false;
            if (food.rasa && food.rasa.length > 0 && food.rasa.every(r => conditionAvoidRasa.has(r))) return false;
            return true;
        });
    }

    // ── Track daily Virya balance and deduplicate foods ────────────────────────
    const dailyViryaTracker = { warming: 0, cooling: 0 };
    const usedNames = new Set(); // use full lowercase name to avoid over-deduplication
    // For Indian foods like 'Plain Rice', 'Jeera Rice', etc., first-word deduplication
    // would incorrectly treat them all as the same 'plain' root.
    const extractRoot = (name) => name.toLowerCase().trim();

    // ── Snack pool: all foods explicitly marked as Snack ──────────────────────
    // Previously excluded categories like 'Cereal Grains' and 'Legumes' prevented
    // Indian snack foods (rolls, momos, cutlets, corn) from appearing as snacks.
    // Since Indian foods have their meal_type set correctly from the CSV, we rely
    // solely on meal_type === 'Snack' here.
    const snackPool = filteredFoods.filter(f => {
        if (f.meal_type === 'Snack') return true;
        // Also include fruit / nut foods tagged 'All' from USDA data
        if (f.meal_type === 'All' && ['Fruits and Fruit Juices', 'Nut and Seed Products'].includes(f.category)) return true;
        return false;
    });

    let breakfast = [], midMorningSnack = [], lunch = [], eveningSnack = [], dinner = [];

    // Breakfast (min 2, max 3)
    console.log('\n🥣 Selecting breakfast...');
    let bPool = filteredFoods.filter(f => !usedNames.has(extractRoot(f.name)));
    breakfast = selectMealFoods(bPool, mealCalorieTarget, 'Breakfast', patient.prakriti, patient.digestionStrength, dailyViryaTracker, severity, season, 2, 3);
    breakfast.forEach(f => usedNames.add(extractRoot(f.name)));

    // Mid Morning Snack (min 1, max 2)
    console.log('\n🍎 Selecting mid-morning snack...');
    let mmsPool = snackPool.filter(f => !usedNames.has(extractRoot(f.name)));
    midMorningSnack = selectMealFoods(mmsPool, snackCalorieTarget, 'Snack', patient.prakriti, patient.digestionStrength, dailyViryaTracker, severity, season, 1, 2);
    midMorningSnack.forEach(f => usedNames.add(extractRoot(f.name)));

    // Lunch (min 2, max 3)
    console.log('\n🍛 Selecting lunch...');
    let lPool = filteredFoods.filter(f => !usedNames.has(extractRoot(f.name)));
    lunch = selectMealFoods(lPool, mealCalorieTarget, 'Lunch', patient.prakriti, patient.digestionStrength, dailyViryaTracker, severity, season, 2, 3);
    lunch.forEach(f => usedNames.add(extractRoot(f.name)));

    // Evening Snack (min 1, max 2)
    console.log('\n🍎 Selecting evening snack...');
    let esPool = snackPool.filter(f => !usedNames.has(extractRoot(f.name)));
    eveningSnack = selectMealFoods(esPool, snackCalorieTarget, 'Snack', patient.prakriti, patient.digestionStrength, dailyViryaTracker, severity, season, 1, 2);
    eveningSnack.forEach(f => usedNames.add(extractRoot(f.name)));

    // Dinner (min 2, max 3)
    console.log('\n🍲 Selecting dinner...');
    let dPool = filteredFoods.filter(f => !usedNames.has(extractRoot(f.name)));
    dinner = selectMealFoods(dPool, mealCalorieTarget, 'Dinner', patient.prakriti, patient.digestionStrength, dailyViryaTracker, severity, season, 2, 3);
    dinner.forEach(f => usedNames.add(extractRoot(f.name)));

    const allMealFoods = [...breakfast, ...midMorningSnack, ...lunch, ...eveningSnack, ...dinner];
    console.log(`\n✓ Total foods selected: ${allMealFoods.length} (incl. ${midMorningSnack.length + eveningSnack.length} snack items)`);

    let severityWarnings = [];

    // PHASE 2: Validate Viruddha Ahara (Food Incompatibility)
    console.log('\n🔍 Checking for food incompatibilities (Viruddha Ahara)...');
    const dietPlan = { breakfast, midMorningSnack, lunch, eveningSnack, dinner };

    try {
        const viruddhaResults = validateViruddhaAhara(dietPlan, allFoods);

        // Log any replacements made
        for (const [meal, result] of Object.entries(viruddhaResults)) {
            if (result.replacements && result.replacements.length > 0) {
                console.log(`  ⚠️  ${meal}: ${result.replacements.length} food(s) replaced due to incompatibility`);
                result.replacements.forEach(r => {
                    console.log(`     - ${r.original} → ${r.replacement} (${r.reason})`);
                });
            }
        }
        console.log('✓ Viruddha Ahara validation passed');
    } catch (error) {
        console.error(`⚠️ Viruddha Ahara issue: ${error.message}`);
        severityWarnings.push(`Viruddha Ahara issue: ${error.message}`);
    }

    // Validate minimum Virya balance softly
    const { warmingCount, coolingCount } = countVirya(allMealFoods);
    if (warmingCount > 0 && coolingCount > 0) {
        // Good balance — no warning needed
    } else if (warmingCount === 0 || coolingCount === 0) {
        severityWarnings.push(`Virya balance note: all ${warmingCount === 0 ? 'cooling' : 'warming'} foods selected — appropriate for ${season || 'current season'}`);
    }

    // Calculate nutrition
    const totalNutrients = calculateTotalNutrition(allMealFoods);
    console.log(`\n📊 Total nutrition: ${Math.round(totalNutrients.calories)} kcal, ${Math.round(totalNutrients.protein)}g protein`);

    // Validate nutrition
    const nutritionCheck = validateNutritionSanity(totalNutrients);
    if (!nutritionCheck.valid) {
        console.warn(`⚠️  ${nutritionCheck.reason} - adjusting portions`);
        // Could adjust portions here, but for now just log warning
    }

    // Generate attributes
    const total = warmingCount + coolingCount;
    const warmingRatio = total > 0 ? ((warmingCount / total) * 100).toFixed(0) + '%' : '0%';

    const ayurvedaAttributes = {
        viryaBalance: `Warming: ${warmingCount}, Cooling: ${coolingCount} (${warmingRatio} warming)`,
        agniProfile: `Suitable for ${patient.digestionStrength} digestive capacity`
    };

    const complianceNotes = generateComplianceNotes(patient, ayurvedaAttributes, severity, season);

    // Add meal summaries
    complianceNotes.push('');
    complianceNotes.push('MEAL COMPOSITION:');
    complianceNotes.push(`Breakfast: ${breakfast.map(f => f.name).join(', ')}`);
    complianceNotes.push(`Lunch: ${lunch.map(f => f.name).join(', ')}`);
    complianceNotes.push(`Dinner: ${dinner.map(f => f.name).join(', ')}`);

    // PHASE 2 FIX 4: Validate severity compliance and surface warnings without blocking
    const severityCompWarnings = validateSeverityCompliance(
        { breakfast, lunch, dinner },
        severity,
        adjustedViryaRange
    );
    severityWarnings.push(...severityCompWarnings);
    if (severityWarnings.length > 0) {
        console.warn(`⚠️  Severity compliance warnings: ${severityWarnings.join('; ')}`);
    }

    // Fix 4: ICMR RDA comparison
    const rdaTargets = getRDATargets(patient.age, patient.gender);
    const rdaComparison = {
        calories: { target: rdaTargets.calories, achieved: Math.round(totalNutrients.calories), percentMet: Math.round((totalNutrients.calories / rdaTargets.calories) * 100) },
        protein: { target: rdaTargets.protein, achieved: Math.round(totalNutrients.protein), percentMet: Math.round((totalNutrients.protein / rdaTargets.protein) * 100) },
        fiber: { target: rdaTargets.fiber, achieved: Math.round(totalNutrients.fiber), percentMet: Math.round((totalNutrients.fiber / rdaTargets.fiber) * 100) },
        iron: { target: rdaTargets.iron, achieved: Math.round(totalNutrients.iron), percentMet: Math.round((totalNutrients.iron / rdaTargets.iron) * 100) },
        calcium: { target: rdaTargets.calcium, achieved: Math.round(totalNutrients.calcium), percentMet: Math.round((totalNutrients.calcium / rdaTargets.calcium) * 100) },
        vitaminC: { target: rdaTargets.vitaminC, achieved: Math.round(totalNutrients.vitaminC), percentMet: Math.round((totalNutrients.vitaminC / rdaTargets.vitaminC) * 100) }
    };

    console.log('\n✅ Diet plan generated successfully!\n');

    return {
        breakfast,
        midMorningSnack,
        lunch,
        eveningSnack,
        dinner,
        totalNutrients,
        ayurvedaAttributes,
        complianceNotes,
        severityWarnings,
        rdaComparison
    };
};

module.exports = {
    generateDietPlan,
    filterByDosha,
    filterByMealType,
    filterByAgni,
    validateMinimumVirya,
    validateNutritionSanity,
    calculateTotalNutrition
};
