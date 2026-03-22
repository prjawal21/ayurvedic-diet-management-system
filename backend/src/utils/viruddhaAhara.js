/**
 * Viruddha Ahara (Food Incompatibility) Validation
 * Classical Ayurvedic food incompatibility rules
 */

// ============================================================================
// INCOMPATIBILITY MATRIX
// ============================================================================

/**
 * Classical Viruddha Ahara combinations to avoid
 * Based on Charaka Samhita and traditional Ayurvedic texts
 */
const INCOMPATIBILITY_MATRIX = {
    // Dairy incompatibilities
    'Cow Milk': ['Banana', 'Mango', 'Curd', 'Papaya', 'Pineapple'],
    'Curd': ['Cow Milk', 'Banana', 'Mango', 'Papaya'],
    'Paneer': ['Banana', 'Mango'],

    // Ghee and honey (equal quantities or heated together)
    'Ghee': ['Honey'],
    'Honey': ['Ghee'],

    // Fruit incompatibilities
    'Banana': ['Cow Milk', 'Curd', 'Buttermilk', 'Paneer'],
    'Mango': ['Cow Milk', 'Curd', 'Paneer'],
    'Papaya': ['Cow Milk', 'Curd'],
    'Pineapple': ['Cow Milk', 'Curd'],
    'Watermelon': ['Cow Milk', 'Curd'],

    // Grain and legume incompatibilities
    'Rice (White)': [], // Generally compatible
    'Brown Rice': [],

    // Radish (not in current dataset but for reference)
    // 'Radish': ['Cow Milk', 'Banana'],
};

/**
 * Category-level incompatibilities
 * Some categories should not be mixed in the same meal
 */
const CATEGORY_INCOMPATIBILITIES = {
    'Fruit': {
        avoidWith: ['Dairy'], // Fruits generally don't mix well with dairy
        exceptions: ['Apple', 'Pear', 'Pomegranate'] // These are okay with dairy
    }
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if two foods are incompatible
 */
const areIncompatible = (food1, food2) => {
    const name1 = food1.name;
    const name2 = food2.name;

    // Direct incompatibility check
    if (INCOMPATIBILITY_MATRIX[name1]?.includes(name2)) {
        return true;
    }
    if (INCOMPATIBILITY_MATRIX[name2]?.includes(name1)) {
        return true;
    }

    // Category-level check
    const cat1 = food1.category;
    const cat2 = food2.category;

    if (CATEGORY_INCOMPATIBILITIES[cat1]) {
        const rule = CATEGORY_INCOMPATIBILITIES[cat1];
        if (rule.avoidWith.includes(cat2)) {
            // Check exceptions
            if (rule.exceptions && (rule.exceptions.includes(name1) || rule.exceptions.includes(name2))) {
                return false;
            }
            return true;
        }
    }

    return false;
};

/**
 * Check a single meal for incompatibilities
 * Returns array of incompatible pairs
 */
const checkMealIncompatibilities = (foods) => {
    const incompatibilities = [];

    for (let i = 0; i < foods.length; i++) {
        for (let j = i + 1; j < foods.length; j++) {
            if (areIncompatible(foods[i], foods[j])) {
                incompatibilities.push({
                    food1: foods[i].name,
                    food2: foods[j].name,
                    reason: `${foods[i].name} and ${foods[j].name} are incompatible (Viruddha Ahara)`
                });
            }
        }
    }

    return incompatibilities;
};

/**
 * Check all meals in a diet plan for incompatibilities
 */
const checkAllMealsForIncompatibilities = (dietPlan) => {
    const allIncompatibilities = [];

    const meals = {
        breakfast: dietPlan.breakfast || [],
        lunch: dietPlan.lunch || [],
        dinner: dietPlan.dinner || []
    };

    for (const [mealType, foods] of Object.entries(meals)) {
        const mealIncompatibilities = checkMealIncompatibilities(foods);
        if (mealIncompatibilities.length > 0) {
            allIncompatibilities.push({
                meal: mealType,
                incompatibilities: mealIncompatibilities
            });
        }
    }

    return allIncompatibilities;
};

/**
 * Find a compatible replacement for an incompatible food
 */
const findCompatibleReplacement = (incompatibleFood, otherMealFoods, availableFoods, mealType) => {
    // Filter available foods by meal type
    const mealTypeFoods = availableFoods.filter(f =>
        f.meal_type === mealType || f.meal_type === 'All'
    );

    // Try to find a food from the same category
    const sameCategoryFoods = mealTypeFoods.filter(f =>
        f.category === incompatibleFood.category &&
        f._id.toString() !== incompatibleFood._id.toString()
    );

    // Check each candidate for compatibility
    for (const candidate of sameCategoryFoods) {
        let isCompatible = true;

        for (const otherFood of otherMealFoods) {
            if (areIncompatible(candidate, otherFood)) {
                isCompatible = false;
                break;
            }
        }

        if (isCompatible) {
            return candidate;
        }
    }

    // If no same-category replacement, try any compatible food
    for (const candidate of mealTypeFoods) {
        if (candidate._id.toString() === incompatibleFood._id.toString()) {
            continue;
        }

        let isCompatible = true;

        for (const otherFood of otherMealFoods) {
            if (areIncompatible(candidate, otherFood)) {
                isCompatible = false;
                break;
            }
        }

        if (isCompatible) {
            return candidate;
        }
    }

    return null; // No compatible replacement found
};

/**
 * Attempt to resolve incompatibilities by replacing foods
 */
const resolveIncompatibilities = (mealFoods, availableFoods, mealType) => {
    const incompatibilities = checkMealIncompatibilities(mealFoods);

    if (incompatibilities.length === 0) {
        return { resolved: true, foods: mealFoods, replacements: [] };
    }

    const replacements = [];
    let modifiedFoods = [...mealFoods];

    // Try to replace the second food in each incompatible pair
    for (const incomp of incompatibilities) {
        const food2Index = modifiedFoods.findIndex(f => f.name === incomp.food2);
        if (food2Index === -1) continue;

        const incompatibleFood = modifiedFoods[food2Index];
        const otherFoods = modifiedFoods.filter((_, idx) => idx !== food2Index);

        const replacement = findCompatibleReplacement(
            incompatibleFood,
            otherFoods,
            availableFoods,
            mealType
        );

        if (replacement) {
            modifiedFoods[food2Index] = replacement;
            replacements.push({
                original: incompatibleFood.name,
                replacement: replacement.name,
                reason: `Replaced due to incompatibility with ${incomp.food1}`
            });
        } else {
            // Could not find replacement
            return {
                resolved: false,
                foods: mealFoods,
                replacements: [],
                unresolvedIncompatibility: incomp
            };
        }
    }

    // Verify all incompatibilities are resolved
    const finalCheck = checkMealIncompatibilities(modifiedFoods);
    if (finalCheck.length > 0) {
        return {
            resolved: false,
            foods: mealFoods,
            replacements: [],
            unresolvedIncompatibility: finalCheck[0]
        };
    }

    return {
        resolved: true,
        foods: modifiedFoods,
        replacements
    };
};

/**
 * Validate Viruddha Ahara for entire diet plan
 * Throws error if unresolvable incompatibilities found
 */
const validateViruddhaAhara = (dietPlan, allFoods) => {
    const results = {
        breakfast: { resolved: true, replacements: [] },
        midMorningSnack: { resolved: true, replacements: [] },
        lunch: { resolved: true, replacements: [] },
        eveningSnack: { resolved: true, replacements: [] },
        dinner: { resolved: true, replacements: [] }
    };

    const meals = ['breakfast', 'midMorningSnack', 'lunch', 'eveningSnack', 'dinner'];

    for (const mealType of meals) {
        if (!dietPlan[mealType] || dietPlan[mealType].length === 0) {
            continue;
        }

        // Map meal slot names to Food.meal_type enum values
        const mealTypeMap = {
            breakfast: 'Breakfast',
            midMorningSnack: 'Snack',
            lunch: 'Lunch',
            eveningSnack: 'Snack',
            dinner: 'Dinner'
        };
        const result = resolveIncompatibilities(
            dietPlan[mealType],
            allFoods,
            mealTypeMap[mealType] || 'All'
        );

        if (!result.resolved) {
            const incomp = result.unresolvedIncompatibility;
            throw new Error(
                `INVALID PLAN — REASON: Viruddha Ahara violation (${incomp.food1} + ${incomp.food2} in ${mealType}). ` +
                `No compatible replacement found.`
            );
        }

        // Update diet plan with resolved foods
        dietPlan[mealType] = result.foods;
        results[mealType] = {
            resolved: true,
            replacements: result.replacements
        };
    }

    return results;
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    INCOMPATIBILITY_MATRIX,
    areIncompatible,
    checkMealIncompatibilities,
    checkAllMealsForIncompatibilities,
    findCompatibleReplacement,
    resolveIncompatibilities,
    validateViruddhaAhara
};
