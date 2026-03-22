/**
 * Severity-Based Tolerance Adjustments
 * Adjusts rule strictness based on Dosha imbalance severity
 */

// ============================================================================
// SEVERITY DEFINITIONS
// ============================================================================

/**
 * Severity-based tolerance adjustments
 * Controls how strict the diet rules are based on imbalance severity
 */
const SEVERITY_ADJUSTMENTS = {
    'Mild': {
        viryaTolerance: 0.15, // ±15% from ideal ratio
        rasaTolerance: 0.20,
        agniStrictness: 'relaxed',
        allowFallback: true,
        maxFoodsPerMeal: 5,
        description: 'Mild imbalance - relaxed tolerances, gentle correction'
    },
    'Moderate': {
        viryaTolerance: 0.10, // ±10% from ideal ratio
        rasaTolerance: 0.15,
        agniStrictness: 'moderate',
        allowFallback: true,
        maxFoodsPerMeal: 4,
        description: 'Moderate imbalance - standard tolerances, balanced correction'
    },
    'Severe': {
        viryaTolerance: 0.05, // ±5% from ideal ratio (very strict)
        rasaTolerance: 0.10,
        agniStrictness: 'strict',
        allowFallback: false, // No relaxation allowed
        maxFoodsPerMeal: 3,
        aggressiveCorrection: true,
        description: 'Severe imbalance - strict tolerances, aggressive correction'
    }
};

// ============================================================================
// SEVERITY ADJUSTMENT FUNCTIONS
// ============================================================================

/**
 * Get severity-based adjustments
 */
const getSeverityAdjustments = (severity) => {
    if (!severity || !SEVERITY_ADJUSTMENTS[severity]) {
        return SEVERITY_ADJUSTMENTS['Moderate']; // Default to moderate
    }
    return SEVERITY_ADJUSTMENTS[severity];
};

/**
 * Adjust Virya ratio range based on severity
 */
const adjustViryaRangeForSeverity = (baseRange, severity) => {
    const severityRule = getSeverityAdjustments(severity);
    const tolerance = severityRule.viryaTolerance;

    // For severe cases, tighten the range
    if (severity === 'Severe') {
        const midpoint = (baseRange.ushnaMin + baseRange.ushnaMax) / 2;
        return {
            ushnaMin: Math.max(0, midpoint - tolerance),
            ushnaMax: Math.min(1, midpoint + tolerance)
        };
    }

    // For mild cases, widen the range
    if (severity === 'Mild') {
        return {
            ushnaMin: Math.max(0, baseRange.ushnaMin - tolerance),
            ushnaMax: Math.min(1, baseRange.ushnaMax + tolerance)
        };
    }

    // Moderate - use base range
    return baseRange;
};

/**
 * Get Agni-based meal structure adjusted for severity
 */
const getAgniMealRulesForSeverity = (agniLevel, severity) => {
    const severityRule = getSeverityAdjustments(severity);

    const baseRules = {
        'Low': {
            maxFoodsPerMeal: 3,
            allowedDigestibility: ['Low'],
            avoidCategories: ['Legume', 'Nut']
        },
        'Medium': {
            maxFoodsPerMeal: 4,
            allowedDigestibility: ['Low', 'Medium'],
            maxHeavyFoods: 1
        },
        'High': {
            maxFoodsPerMeal: 5,
            allowedDigestibility: ['Low', 'Medium', 'High'],
            maxHeavyFoods: 2
        }
    };

    const rules = baseRules[agniLevel] || baseRules['Medium'];

    // Apply severity adjustment to max foods
    if (severity === 'Severe') {
        rules.maxFoodsPerMeal = Math.min(rules.maxFoodsPerMeal, severityRule.maxFoodsPerMeal);
    } else if (severity === 'Mild') {
        rules.maxFoodsPerMeal = Math.min(rules.maxFoodsPerMeal + 1, 6);
    }

    return rules;
};

/**
 * Check if fallback is allowed based on severity
 */
const isFallbackAllowed = (severity) => {
    const severityRule = getSeverityAdjustments(severity);
    return severityRule.allowFallback;
};

/**
 * Validate severity-based compliance
 */
const validateSeverityCompliance = (dietPlan, severity, targetViryaRatio) => {
    if (!severity) {
        return [];
    }

    const issues = [];
    const severityRule = getSeverityAdjustments(severity);

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
    const actualRatio = total > 0 ? warmingCount / total : 0;

    // Check if within severity tolerance
    const targetMid = (targetViryaRatio.ushnaMin + targetViryaRatio.ushnaMax) / 2;
    const deviation = Math.abs(actualRatio - targetMid);

    if (deviation > severityRule.viryaTolerance) {
        issues.push(
            `Virya ratio deviation (${Math.round(deviation * 100)}%) exceeds ${severity} tolerance (${Math.round(severityRule.viryaTolerance * 100)}%)`
        );
    }

    // Check meal food count for severe cases
    if (severity === 'Severe') {
        const meals = ['breakfast', 'lunch', 'dinner'];
        for (const meal of meals) {
            if (dietPlan[meal] && dietPlan[meal].length > severityRule.maxFoodsPerMeal) {
                issues.push(
                    `${meal} has ${dietPlan[meal].length} foods, exceeds severe imbalance limit of ${severityRule.maxFoodsPerMeal}`
                );
            }
        }
    }

    return issues;
};

/**
 * Generate severity explanation for compliance notes
 */
const explainSeverityAdjustment = (severity) => {
    const severityRule = getSeverityAdjustments(severity);
    return `Dosha imbalance severity: ${severity} - ${severityRule.description}`;
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    SEVERITY_ADJUSTMENTS,
    getSeverityAdjustments,
    adjustViryaRangeForSeverity,
    getAgniMealRulesForSeverity,
    isFallbackAllowed,
    validateSeverityCompliance,
    explainSeverityAdjustment
};
