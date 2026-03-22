/**
 * ICMR 2020 Recommended Dietary Allowances (RDA) for Indian population.
 * Source: ICMR-NIN Expert Group on Nutrient Requirements, 2020.
 * Values are per-day totals.
 */

const RDA_TABLE = {
    child: {            // Age < 12 (using 10-12y values as representative)
        calories: 1690,
        protein: 29,
        iron: 9,
        calcium: 600,
        vitaminC: 40,
        b12: 0.9,
        vitaminD: 600,
        fiber: 25
    },
    adultMale: {        // Male 19-59
        calories: 2730,
        protein: 54,
        iron: 17,
        calcium: 600,
        vitaminC: 40,
        b12: 1,
        vitaminD: 600,
        fiber: 40
    },
    adultFemale: {      // Female 19-59
        calories: 2230,
        protein: 46,
        iron: 21,
        calcium: 600,
        vitaminC: 40,
        b12: 1,
        vitaminD: 600,
        fiber: 40
    },
    elderlyMale: {      // Male 60+
        calories: 2000,
        protein: 54,
        iron: 17,
        calcium: 600,
        vitaminC: 40,
        b12: 1,
        vitaminD: 800,
        fiber: 40
    },
    elderlyFemale: {    // Female 60+
        calories: 1900,
        protein: 46,
        iron: 21,
        calcium: 1200,
        vitaminC: 40,
        b12: 1,
        vitaminD: 800,
        fiber: 40
    }
};

/**
 * Get ICMR RDA targets for a given age and gender.
 * Returns an object with nutrient keys matching totalNutrients field names.
 * @param {number} age
 * @param {string} gender — 'Male' | 'Female' | 'Other'
 */
const getRDATargets = (age, gender) => {
    let tier;

    if (age < 12) {
        tier = RDA_TABLE.child;
    } else if (age >= 60) {
        tier = gender === 'Male' ? RDA_TABLE.elderlyMale : RDA_TABLE.elderlyFemale;
    } else {
        tier = gender === 'Male' ? RDA_TABLE.adultMale : RDA_TABLE.adultFemale;
    }

    return {
        calories: tier.calories,
        protein: tier.protein,
        iron: tier.iron,
        calcium: tier.calcium,
        vitaminC: tier.vitaminC,
        vitaminB12: tier.b12,
        vitaminD: tier.vitaminD,
        fiber: tier.fiber
    };
};

module.exports = { getRDATargets, RDA_TABLE };
