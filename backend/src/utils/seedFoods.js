/**
 * VedaCare — USDA SR Legacy Food Seed Script
 * Usage: cd backend && npm run seed-usda
 * Requires CSV files in: data/usda_sr_legacy/
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

let Food;
try { Food = require('./Food'); } catch {
  try { Food = require('../models/Food'); } catch {
    Food = require('../../src/models/Food');
  }
}

const USDA_DIR = path.join(__dirname, '../../../data/usda_sr_legacy');
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const NUTRIENT_MAP = {
  1008: 'calories', 2047: 'calories',
  1003: 'protein', 1005: 'carbs', 1004: 'fat',
  1079: 'fiber', 1087: 'calcium', 1089: 'iron',
  1093: 'sodium', 1092: 'potassium', 1162: 'vitaminC',
  1114: 'vitaminD', 1178: 'vitaminB12', 1095: 'zinc',
  1090: 'magnesium', 1404: 'omega3', 1177: 'folate',
};

const CATEGORY_DEFAULTS = {
  'Dairy and Egg Products':             { meal_type: 'All',       dosha_suitable: 'Tridosha' },
  'Spices and Herbs':                   { meal_type: 'All',       dosha_suitable: 'Tridosha' },
  'Baby Foods':                         { meal_type: 'All',       dosha_suitable: 'Tridosha' },
  'Fats and Oils':                      { meal_type: 'All',       dosha_suitable: 'Tridosha' },
  'Poultry Products':                   { meal_type: 'Lunch',     dosha_suitable: 'Pitta'    },
  'Soups, Sauces, and Gravies':         { meal_type: 'Lunch',     dosha_suitable: 'Tridosha' },
  'Sausages and Luncheon Meats':        { meal_type: 'Lunch',     dosha_suitable: 'Pitta'    },
  'Breakfast Cereals':                  { meal_type: 'Breakfast', dosha_suitable: 'Tridosha' },
  'Fruits and Fruit Juices':            { meal_type: 'Snack',     dosha_suitable: 'Tridosha' },
  'Pork Products':                      { meal_type: 'Lunch',     dosha_suitable: 'Pitta'    },
  'Vegetables and Vegetable Products':  { meal_type: 'All',       dosha_suitable: 'Tridosha' },
  'Nut and Seed Products':              { meal_type: 'Snack',     dosha_suitable: 'Vata'     },
  'Beef Products':                      { meal_type: 'Lunch',     dosha_suitable: 'Pitta'    },
  'Beverages':                          { meal_type: 'All',       dosha_suitable: 'Tridosha' },
  'Finfish and Shellfish Products':     { meal_type: 'Lunch',     dosha_suitable: 'Pitta'    },
  'Legumes and Legume Products':        { meal_type: 'All',       dosha_suitable: 'Tridosha' },
  'Lamb, Veal, and Game Products':      { meal_type: 'Lunch',     dosha_suitable: 'Pitta'    },
  'Baked Products':                     { meal_type: 'Breakfast', dosha_suitable: 'Tridosha' },
  'Sweets':                             { meal_type: 'Snack',     dosha_suitable: 'Kapha'    },
  'Cereal Grains and Pasta':            { meal_type: 'All',       dosha_suitable: 'Tridosha' },
  'Fast Foods':                         { meal_type: 'Lunch',     dosha_suitable: 'Pitta'    },
  'Meals, Entrees, and Side Dishes':    { meal_type: 'Lunch',     dosha_suitable: 'Tridosha' },
  'Snacks':                             { meal_type: 'Snack',     dosha_suitable: 'Tridosha' },
  'American Indian/Alaska Native Foods':{ meal_type: 'All',       dosha_suitable: 'Tridosha' },
  'Restaurant Foods':                   { meal_type: 'Lunch',     dosha_suitable: 'Tridosha' },
  'Alcoholic Beverages':                { meal_type: 'All',       dosha_suitable: 'Pitta'    },
};

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

function sanitizeNumber(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

async function seed() {
  console.log('🌿 VedaCare USDA Seed Script starting...\n');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  console.log('\n📂 Reading USDA CSV files...');
  const foods         = parseCSV(path.join(USDA_DIR, 'food.csv'));
  const foodNutrients = parseCSV(path.join(USDA_DIR, 'food_nutrient.csv'));
  const foodCategories = parseCSV(path.join(USDA_DIR, 'food_category.csv'));
  console.log(`   food.csv          → ${foods.length} items`);
  console.log(`   food_nutrient.csv → ${foodNutrients.length} rows`);

  const categoryMap = {};
  for (const cat of foodCategories) categoryMap[cat.id] = cat.description;

  const validNutrientIds = new Set(Object.keys(NUTRIENT_MAP).map(String));

  console.log('\n⚙️  Building nutrient index...');
  const nutrientIndex = {};
  for (const row of foodNutrients) {
    const nid = row.nutrient_id;
    if (!validNutrientIds.has(nid)) continue;
    const field = NUTRIENT_MAP[nid];
    if (!field) continue;
    const fdcId = row.fdc_id;
    if (!nutrientIndex[fdcId]) nutrientIndex[fdcId] = {};
    if (field === 'calories' && nutrientIndex[fdcId].calories !== undefined && nid === '2047') continue;
    nutrientIndex[fdcId][field] = sanitizeNumber(row.amount);
  }

  console.log('\n🔨 Building food documents...');
  const foodDocs = [];

  for (const food of foods) {
    const fdcId = food.fdc_id;
    const name = food.description;
    if (!name || name.trim() === '') continue;
    const categoryDesc = categoryMap[food.food_category_id] || 'Unknown';
    if (categoryDesc === 'Quality Control Materials') continue;
    if (categoryDesc === 'Branded Food Products Database') continue;
    const n = nutrientIndex[fdcId] || {};
    const defaults = CATEGORY_DEFAULTS[categoryDesc] || { meal_type: 'All', dosha_suitable: 'Tridosha' };

    foodDocs.push({
      name: name.trim(),
      category: categoryDesc,
      energy: n.calories || 0,
      glycemic_index: 0,
      virya: 'Cooling',
      calories:      n.calories      || 0,
      protein:       n.protein       || 0,
      carbs:         n.carbs         || 0,
      fat:           n.fat           || 0,
      fiber:         n.fiber         || 0,
      calcium:       n.calcium       || 0,
      iron:          n.iron          || 0,
      sodium:        n.sodium        || 0,
      potassium:     n.potassium     || 0,
      vitaminC:      n.vitaminC      || 0,
      vitaminD:      n.vitaminD      || 0,
      vitaminB12:    n.vitaminB12    || 0,
      zinc:          n.zinc          || 0,
      magnesium:     n.magnesium     || 0,
      omega3:        n.omega3        || 0,
      folate:        n.folate        || 0,
      meal_type:     defaults.meal_type,
      dosha_suitable: defaults.dosha_suitable,
      rasa: [], guna: [],
      agni_level: 'Medium',
      portionSize: 100,
      isClinicApproved: false,
      source: 'USDA SR Legacy 2018',
    });
  }

  console.log(`   Built ${foodDocs.length} food documents`);

  const existingNames = new Set(
    (await Food.find({}, 'name').lean()).map(f => f.name.toLowerCase())
  );
  const newFoods = foodDocs.filter(f => !existingNames.has(f.name.toLowerCase()));
  console.log(`   Already in DB: ${existingNames.size}`);
  console.log(`   New to insert: ${newFoods.length}`);

  if (newFoods.length === 0) {
    console.log('\n⚠️  No new foods to insert. Database already seeded.');
  } else {
    const BATCH_SIZE = 500;
    let inserted = 0;
    for (let i = 0; i < newFoods.length; i += BATCH_SIZE) {
      const batch = newFoods.slice(i, i + BATCH_SIZE);
      await Food.insertMany(batch, { ordered: false });
      inserted += batch.length;
      process.stdout.write(`\r   Inserted: ${inserted}/${newFoods.length}`);
    }
    console.log(`\n\n✅ Seeding complete. ${inserted} foods added.`);
  }

  const total = await Food.countDocuments();
  const approved = await Food.countDocuments({ isClinicApproved: true });
  console.log(`\n📊 Database summary:`);
  console.log(`   Total foods:         ${total}`);
  console.log(`   isClinicApproved:    ${approved}`);
  await mongoose.disconnect();
  console.log('\n🌿 Done.\n');
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
