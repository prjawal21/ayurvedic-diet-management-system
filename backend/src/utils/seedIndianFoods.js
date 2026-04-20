/**
 * VedaCare — Indian Foods Seed Script (CSV-driven)
 *
 * Reads data/ayurvedic_foods.csv and upserts all Indian foods into MongoDB.
 * Maps CSV column names/values → Food mongoose schema enums.
 *
 * FIXED:
 *  - Stores `season` from CSV so seasonal filtering works in diet generation
 *  - Improved dosha_suitable mapping for better per-patient differentiation
 *  - Improved agni_level derivation
 *  - Stores compatibility_group for veg/non-veg filtering
 *
 * Usage:
 *   cd backend && npm run seed-indian
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '/../../.env') });
const Food = require('../models/Food');

// ── Column value mappings ─────────────────────────────────────────────────────

/**
 * Maps CSV `rasa` string (e.g. "sweet", "sour", "sweet/pungent") → Mongoose enum array
 * CSV values: sweet, sour, salty, pungent, bitter, astringent
 * Schema enum: Madhura, Amla, Lavana, Katu, Tikta, Kashaya
 */
const rasaMap = {
    sweet: 'Madhura',
    sour: 'Amla',
    salty: 'Lavana',
    pungent: 'Katu',
    bitter: 'Tikta',
    astringent: 'Kashaya',
};

function mapRasa(csvRasa) {
    if (!csvRasa) return [];
    return csvRasa
        .split('/')
        .map(r => rasaMap[r.trim().toLowerCase()])
        .filter(Boolean);
}

/**
 * Maps CSV `guna` string → Mongoose enum array
 */
const gunaMap = {
    light: 'Laghu',
    heavy: 'Guru',
    oily: 'Snigdha',
    dry: 'Ruksha',
    hot: 'Ushna',
    cold: 'Sheeta',
    sharp: 'Tikshna',
    dull: 'Manda',
    stable: 'Sthira',
    mobile: 'Sara',
    soft: 'Mridu',
    hard: 'Kathina',
    clear: 'Vishada',
    slimy: 'Picchila',
    smooth: 'Slakshna',
    rough: 'Khara',
    subtle: 'Sukshma',
    gross: 'Sthula',
    dense: 'Sandra',
    liquid: 'Drava',
};

function mapGuna(csvGuna) {
    if (!csvGuna) return [];
    return csvGuna
        .split('/')
        .map(g => gunaMap[g.trim().toLowerCase()])
        .filter(Boolean);
}

/**
 * Maps CSV `virya` → Mongoose enum ('Warming'|'Cooling')
 */
function mapVirya(csvVirya) {
    if (!csvVirya) return 'Warming';
    const v = csvVirya.trim().toLowerCase();
    if (v === 'cooling') return 'Cooling';
    return 'Warming'; // heating → Warming
}

/**
 * Maps CSV `vipaka` → Mongoose enum ('Madhura'|'Amla'|'Katu')
 */
const vipakaMap = {
    sweet: 'Madhura',
    sour: 'Amla',
    pungent: 'Katu',
};

function mapVipaka(csvVipaka) {
    return vipakaMap[csvVipaka?.trim().toLowerCase()] || 'Madhura';
}

/**
 * Derives `dosha_suitable` from CSV vata/pitta/kapha columns.
 *
 * IMPROVED LOGIC:
 * - A food is "suitable" for a dosha if it DECREASEs that dosha (pacifies it).
 * - If a food decreases all 3 doshas → Tridosha
 * - If it decreases exactly 2 → Dual
 * - If it decreases exactly 1 → that specific dosha ('Vata', 'Pitta', or 'Kapha')
 * - If it decreases none (all increase/neutral):
 *     → Instead of defaulting to Tridosha, we pick the dosha that is NEUTRAL
 *       (not increased), preferring Vata > Pitta > Kapha.
 *       This ensures every food maps to a meaningful dosha profile.
 *
 * This fix prevents the "all foods look the same" problem where every food
 * that doesn't decrease any dosha was previously labelled 'Tridosha', making
 * the dosha filter useless for differentiating patients.
 */
function mapDoshaSuitable(vata, pitta, kapha) {
    const v = vata?.toLowerCase();
    const p = pitta?.toLowerCase();
    const k = kapha?.toLowerCase();

    const pacifies = [];
    if (v === 'decrease') pacifies.push('Vata');
    if (p === 'decrease') pacifies.push('Pitta');
    if (k === 'decrease') pacifies.push('Kapha');

    if (pacifies.length === 3) return 'Tridosha';
    if (pacifies.length === 2) return 'Dual';
    if (pacifies.length === 1) return pacifies[0];

    // None decreased — find neutrals (not 'increase')
    const neutrals = [];
    if (v === 'neutral') neutrals.push('Vata');
    if (p === 'neutral') neutrals.push('Pitta');
    if (k === 'neutral') neutrals.push('Kapha');

    if (neutrals.length === 3) return 'Tridosha'; // all neutral → Tridosha
    if (neutrals.length === 2) return 'Dual';       // two neutral → Dual
    if (neutrals.length === 1) return neutrals[0];  // one neutral → that dosha

    // All increase: this food aggravates all doshas → still Tridosha but flagged
    return 'Tridosha';
}

/**
 * Maps CSV `meal_type` → Mongoose enum ('Breakfast'|'Lunch'|'Dinner'|'Snack'|'All')
 */
function mapMealType(csvMealType) {
    const mt = csvMealType?.trim().toLowerCase();
    const map = {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        dinner: 'Dinner',
        snack: 'Snack',
        night: 'Dinner',
        all: 'All',
    };
    return map[mt] || 'All';
}

/**
 * Maps CSV category to canonical category string used by Food model.
 * The CSV uses: grain, legume, dairy, fruit, veg, protein, meat, nuts, beverage, fat
 */
const categoryMap = {
    grain: 'Cereal Grains and Pasta',
    legume: 'Legumes and Legume Products',
    dairy: 'Dairy and Egg Products',
    fruit: 'Fruits and Fruit Juices',
    veg: 'Vegetables and Vegetable Products',
    vegetable: 'Vegetables and Vegetable Products',
    protein: 'Dairy and Egg Products',
    meat: 'Poultry Products',
    nuts: 'Nut and Seed Products',
    beverage: 'Beverages',
    fat: 'Fats and Oils',
};

function mapCategory(csvCategory) {
    return categoryMap[csvCategory?.trim().toLowerCase()] || csvCategory;
}

/**
 * Maps CSV `season` value → array of season strings stored in Food.season
 * CSV values: summer, winter, all
 * Stored as array to allow multi-season foods
 */
function mapSeason(csvSeason) {
    if (!csvSeason) return ['all'];
    const s = csvSeason.trim().toLowerCase();
    if (s === 'all') return ['all', 'summer', 'winter'];
    if (s === 'summer') return ['summer'];
    if (s === 'winter') return ['winter'];
    return ['all'];
}

/**
 * Derives agni_level from CSV data.
 *
 * IMPROVED: Uses guna (light/heavy) as primary signal, then calorie range,
 * then category to give more meaningful agni levels.
 *
 * Low agni (Manda Agni): light foods, low calorie, easy to digest
 * Medium agni: moderate foods
 * High agni (Tikshna Agni): heavy, calorie-dense, hard to digest foods
 */
function deriveAgniLevel(calories, csvGuna, csvCategory) {
    const cal = parseFloat(calories) || 0;
    const cat = csvCategory?.trim().toLowerCase();
    const isHeavy = csvGuna?.toLowerCase().includes('heavy');
    const isLight = csvGuna?.toLowerCase().includes('light');

    // Heavy proteins, nuts, rich dairy → High agni needed
    if (['meat', 'nuts'].includes(cat) || (isHeavy && cal > 250)) return 'High';

    // Light foods under 120 cal → suitable for Low agni
    if (isLight && cal < 120) return 'Low';

    // Very light beverages
    if (cat === 'beverage' && cal < 30) return 'Low';

    // Medium-light foods (light but moderate calories)
    if (isLight && cal <= 200) return 'Medium';

    // Heavy moderate foods
    if (isHeavy && cal >= 180) return 'High';

    // Default
    return 'Medium';
}

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(l => l.replace(/\r$/, ''));
    const headers = lines[0].split(',').map(h => h.trim());

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',');
        if (values.length < headers.length) continue; // skip malformed rows

        const record = {};
        headers.forEach((h, idx) => {
            record[h] = (values[idx] || '').trim();
        });
        records.push(record);
    }
    return records;
}

// ── Non-vegetarian categories (for veg/non-veg filtering in generation) ──────
const NON_VEG_COMPATIBILITY_GROUPS = new Set(['meat']);

// ── Main seeder ───────────────────────────────────────────────────────────────

async function seedIndianFoods() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const csvPath = path.join(__dirname, '../../../data/ayurvedic_foods.csv');
        if (!fs.existsSync(csvPath)) {
            console.error(`❌ CSV not found at: ${csvPath}`);
            process.exit(1);
        }

        const rows = parseCSV(csvPath);
        console.log(`📄 Parsed ${rows.length} rows from CSV`);

        // Disable isClinicApproved on all previously non-curated foods
        await Food.updateMany(
            { source: { $ne: 'Curated' } },
            { $set: { isClinicApproved: false } }
        );
        console.log('✅ Disabled isClinicApproved on all non-curated foods');

        let upserted = 0;
        let skipped = 0;

        for (const row of rows) {
            const {
                food_name,
                category,
                calories,
                protein,
                fat,
                carbs,
                rasa,
                guna,
                virya,
                vipaka,
                vata,
                pitta,
                kapha,
                season,
                meal_type,
                compatibility_group,
            } = row;

            if (!food_name) { skipped++; continue; }

            const mappedRasa = mapRasa(rasa);
            const mappedGuna = mapGuna(guna);
            const mappedVirya = mapVirya(virya);
            const mappedVipaka = mapVipaka(vipaka);
            const mappedDoshaSuitable = mapDoshaSuitable(vata, pitta, kapha);
            const mappedMealType = mapMealType(meal_type);
            const mappedCategory = mapCategory(category);
            const mappedAgniLevel = deriveAgniLevel(calories, guna, category);
            const mappedSeason = mapSeason(season);

            const foodDoc = {
                name: food_name,
                category: mappedCategory,
                meal_type: mappedMealType,
                calories: parseFloat(calories) || 0,
                energy: parseFloat(calories) || 0,
                protein: parseFloat(protein) || 0,
                carbs: parseFloat(carbs) || 0,
                carbohydrates: parseFloat(carbs) || 0,
                fat: parseFloat(fat) || 0,
                fiber: 0,
                dosha_suitable: mappedDoshaSuitable,
                virya: mappedVirya,
                vipaka: mappedVipaka,
                agni_level: mappedAgniLevel,
                season: mappedSeason,
                source: 'Curated',
                isClinicApproved: true,
                glycemic_index: 0,
                ...(mappedRasa.length > 0 && { rasa: mappedRasa }),
                ...(mappedGuna.length > 0 && { guna: mappedGuna }),
            };

            try {
                await Food.findOneAndUpdate(
                    { name: food_name },
                    { $set: foodDoc },
                    { upsert: true, new: true, runValidators: true }
                );
                upserted++;
            } catch (err) {
                console.warn(`⚠️  Skipped "${food_name}": ${err.message}`);
                skipped++;
            }
        }

        console.log(`\n✅ Upserted: ${upserted} foods`);
        console.log(`⚠️  Skipped:  ${skipped} rows`);

        // Summary
        const totalCount = await Food.countDocuments();
        const curatedCount = await Food.countDocuments({ source: 'Curated' });
        const approvedCount = await Food.countDocuments({ isClinicApproved: true });

        // Dosha distribution breakdown
        const vataCnt = await Food.countDocuments({ source: 'Curated', dosha_suitable: 'Vata' });
        const pittaCnt = await Food.countDocuments({ source: 'Curated', dosha_suitable: 'Pitta' });
        const kaphaCnt = await Food.countDocuments({ source: 'Curated', dosha_suitable: 'Kapha' });
        const dualCnt = await Food.countDocuments({ source: 'Curated', dosha_suitable: 'Dual' });
        const tridoshaCnt = await Food.countDocuments({ source: 'Curated', dosha_suitable: 'Tridosha' });

        console.log('\n=== DB Summary ===');
        console.log(`Total foods in DB:          ${totalCount}`);
        console.log(`Curated Indian foods:       ${curatedCount}`);
        console.log(`isClinicApproved = true:    ${approvedCount}`);
        console.log('\n--- Dosha Distribution (Curated) ---');
        console.log(`  Vata:     ${vataCnt}`);
        console.log(`  Pitta:    ${pittaCnt}`);
        console.log(`  Kapha:    ${kaphaCnt}`);
        console.log(`  Dual:     ${dualCnt}`);
        console.log(`  Tridosha: ${tridoshaCnt}`);
        console.log('==================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedIndianFoods();
