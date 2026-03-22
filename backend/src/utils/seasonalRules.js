/**
 * Seasonal (Ritu) Rules for Ayurvedic Diet Planning
 * Adjusts diet recommendations based on the six Ayurvedic seasons
 */

// ============================================================================
// SEASONAL DEFINITIONS
// ============================================================================

/**
 * Six Ayurvedic seasons (Ritu) with their characteristics
 */
const SEASONAL_RULES = {
    'Vasanta': { // Spring (March-April)
        name: 'Vasanta (Spring)',
        dominantDosha: 'Kapha',
        viryaBias: 'Warming',
        viryaAdjustment: { ushnaMin: 0.4, ushnaMax: 0.7 },
        rasaBias: ['Katu', 'Tikta', 'Kashaya'], // Pungent, Bitter, Astringent
        avoidRasa: ['Madhura', 'Amla'], // Sweet, Sour
        description: 'Spring season - reduce Kapha, favor light and warming foods'
    },
    'Grishma': { // Summer (May-June)
        name: 'Grishma (Summer)',
        dominantDosha: 'Pitta',
        viryaBias: 'Cooling',
        viryaAdjustment: { ushnaMin: 0.2, ushnaMax: 0.5 },
        rasaBias: ['Madhura', 'Tikta'], // Sweet, Bitter
        avoidRasa: ['Katu', 'Amla', 'Lavana'], // Pungent, Sour, Salty
        description: 'Summer season - reduce Pitta, favor cooling and sweet foods'
    },
    'Varsha': { // Monsoon (July-August)
        name: 'Varsha (Monsoon)',
        dominantDosha: 'Vata',
        viryaBias: 'Warming',
        viryaAdjustment: { ushnaMin: 0.45, ushnaMax: 0.75 },
        rasaBias: ['Amla', 'Lavana', 'Madhura'], // Sour, Salty, Sweet
        avoidRasa: ['Tikta', 'Kashaya'], // Bitter, Astringent
        description: 'Monsoon season - balance Vata, favor warm and nourishing foods'
    },
    'Sharad': { // Autumn (September-October)
        name: 'Sharad (Autumn)',
        dominantDosha: 'Pitta',
        viryaBias: 'Cooling',
        viryaAdjustment: { ushnaMin: 0.25, ushnaMax: 0.55 },
        rasaBias: ['Madhura', 'Tikta', 'Kashaya'], // Sweet, Bitter, Astringent
        avoidRasa: ['Katu', 'Amla', 'Lavana'], // Pungent, Sour, Salty
        description: 'Autumn season - reduce Pitta, favor cooling and sweet foods'
    },
    'Hemanta': { // Early Winter (November-December)
        name: 'Hemanta (Early Winter)',
        dominantDosha: 'Vata',
        viryaBias: 'Warming',
        viryaAdjustment: { ushnaMin: 0.5, ushnaMax: 0.8 },
        rasaBias: ['Madhura', 'Amla', 'Lavana'], // Sweet, Sour, Salty
        avoidRasa: ['Tikta', 'Kashaya'], // Bitter, Astringent
        description: 'Early winter - balance Vata, favor warming and nourishing foods'
    },
    'Shishira': { // Late Winter (January-February)
        name: 'Shishira (Late Winter)',
        dominantDosha: 'Kapha',
        viryaBias: 'Warming',
        viryaAdjustment: { ushnaMin: 0.55, ushnaMax: 0.85 },
        rasaBias: ['Katu', 'Tikta', 'Kashaya'], // Pungent, Bitter, Astringent
        avoidRasa: ['Madhura'], // Sweet
        description: 'Late winter - reduce Kapha, favor warming and light foods'
    }
};

// ============================================================================
// SEASONAL ADJUSTMENT FUNCTIONS
// ============================================================================

/**
 * Get seasonal adjustments for a given season
 */
const getSeasonalAdjustments = (season) => {
    if (!season || !SEASONAL_RULES[season]) {
        return null;
    }
    return SEASONAL_RULES[season];
};

/**
 * Apply seasonal bias to food selection
 * Prioritizes foods that match seasonal Virya preference
 */
const applySeasonalBias = (foods, season) => {
    if (!season || !SEASONAL_RULES[season]) {
        return foods;
    }

    const seasonalRule = SEASONAL_RULES[season];
    const viryaBias = seasonalRule.viryaBias;
    const rasaBias = seasonalRule.rasaBias || [];
    const avoidRasa = seasonalRule.avoidRasa || [];

    // Step 1: Filter out foods where rasa is annotated AND entirely in the avoid list.
    // Foods with no rasa field (null / undefined / empty array) are unannotated — keep them.
    const filtered = foods.filter(food => {
        const rasa = food.rasa;
        // Pass through unannotated foods
        if (!rasa || rasa.length === 0) return true;
        // Exclude only if EVERY rasa value is in the avoid list
        return !rasa.every(r => avoidRasa.includes(r));
    });

    // Step 2: Sort — rasaBias preferred first, then by seasonal Virya
    return [...filtered].sort((a, b) => {
        const aHasRasaBias = a.rasa && a.rasa.some(r => rasaBias.includes(r));
        const bHasRasaBias = b.rasa && b.rasa.some(r => rasaBias.includes(r));

        if (aHasRasaBias && !bHasRasaBias) return -1;
        if (!aHasRasaBias && bHasRasaBias) return 1;

        // Secondary sort: seasonal Virya preference
        if (a.virya === viryaBias && b.virya !== viryaBias) return -1;
        if (a.virya !== viryaBias && b.virya === viryaBias) return 1;
        return 0;
    });
};

/**
 * Adjust Virya ratio based on season
 */
const getSeasonalViryaRatio = (season, basePrakritiRatio) => {
    if (!season || !SEASONAL_RULES[season]) {
        return basePrakritiRatio;
    }

    const seasonalRule = SEASONAL_RULES[season];
    return seasonalRule.viryaAdjustment;
};

/**
 * Validate seasonal compliance
 * Returns warnings if diet doesn't align with seasonal recommendations
 */
const validateSeasonalCompliance = (dietPlan, season) => {
    if (!season || !SEASONAL_RULES[season]) {
        return [];
    }

    const warnings = [];
    const seasonalRule = SEASONAL_RULES[season];

    // Count Virya distribution
    const allFoods = [
        ...(dietPlan.breakfast || []),
        ...(dietPlan.lunch || []),
        ...(dietPlan.dinner || [])
    ];

    let warmingCount = 0;
    let coolingCount = 0;

    allFoods.forEach(food => {
        if (food.virya === 'Warming') warmingCount++;
        if (food.virya === 'Cooling') coolingCount++;
    });

    const total = warmingCount + coolingCount;
    const warmingRatio = total > 0 ? warmingCount / total : 0;

    // Check if Virya ratio aligns with seasonal recommendation
    if (seasonalRule.viryaBias === 'Warming' && warmingRatio < 0.4) {
        warnings.push(
            `Seasonal mismatch: ${seasonalRule.name} recommends more warming foods (current: ${Math.round(warmingRatio * 100)}%)`
        );
    } else if (seasonalRule.viryaBias === 'Cooling' && warmingRatio > 0.6) {
        warnings.push(
            `Seasonal mismatch: ${seasonalRule.name} recommends more cooling foods (current: ${Math.round(warmingRatio * 100)}% warming)`
        );
    }

    return warnings;
};

/**
 * Generate seasonal explanation for compliance notes
 */
const explainSeasonalChoice = (season) => {
    if (!season || !SEASONAL_RULES[season]) {
        return 'No seasonal adjustments applied';
    }

    const seasonalRule = SEASONAL_RULES[season];
    return `Seasonal adjustments for ${seasonalRule.name}: ${seasonalRule.description}`;
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    SEASONAL_RULES,
    getSeasonalAdjustments,
    applySeasonalBias,
    getSeasonalViryaRatio,
    validateSeasonalCompliance,
    explainSeasonalChoice
};
