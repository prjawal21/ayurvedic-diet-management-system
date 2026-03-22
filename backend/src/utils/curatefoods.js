/**
 * VedaCare — Food Curation Script
 * Sets isClinicApproved:true on whole/clinical foods matched by name keywords,
 * then revokes approval from clearly processed/packaged items.
 * Run via: npm run curate (from backend/)
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Food = require('../models/Food');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/vedacare';

const KEYWORD_GROUPS = [
    // Grains & Staples — tightened: 'bread' → specific whole-grain only; 'corn' → sweet/whole only
    { label: 'Grains & Staples', regex: /\brice\b|wheat flour|wheat, hard|wheat, soft|whole wheat|barley|oat|millet|rye|sorghum|quinoa|semolina|whole wheat bread|brown bread|multigrain bread|roti|chapati|naan|pita bread|dosa|idli|upma|poha|porridge|corn, sweet|corn on the cob|cornmeal, whole.?grain|popcorn, air-popped/i },
    // Legumes & Pulses
    { label: 'Legumes & Pulses', regex: /lentil|chickpea|kidney bean|black gram|mung|moong|urad|chana|dal|dahl|rajma|soybean|pigeon pea|cowpea|green bean|black-eyed|split pea/i },
    // Vegetables
    { label: 'Vegetables', regex: /spinach|potato, baked|potato, boiled|potato, raw|tomato|onion|garlic|ginger|carrot|pumpkin|gourd|eggplant|brinjal|okra|cauliflower|cabbage|broccoli|cucumber|radish|beetroot|mushroom|yam|taro|drumstick|bitter gourd|bottle gourd|ridge gourd|ivy gourd|cluster bean|french bean|sweet potato|turnip|leek|celery|asparagus|kale|lettuce|capsicum|bell pepper/i },
    // Fruits — tightened: 'coconut' → raw/water/oil only (not pudding mix)
    { label: 'Fruits', regex: /apple|banana|mango|orange|grape|papaya|pomegranate|guava|coconut, raw|coconut water|coconut milk, raw|date|fig|lemon|lime|pear|peach|plum|apricot|cherry|strawberry|blueberry|watermelon|melon|pineapple|jackfruit|tamarind|amla|jamun/i },
    // Dairy
    { label: 'Dairy', regex: /\bmilk\b|yogurt|curd|ghee|butter|paneer|cheese|cream|whey|lassi/i },
    // Nuts & Seeds
    { label: 'Nuts & Seeds', regex: /almond|walnut|cashew|pistachio|peanut|groundnut|sesame seed|flaxseed|chia seed|sunflower seed|pumpkin seed|hemp seed|pine nut|hazelnut|brazil nut/i },
    // Spices & Herbs
    { label: 'Spices & Herbs', regex: /turmeric|cumin|coriander|cardamom|cinnamon|clove|black pepper|mustard seed|fenugreek|ajwain|asafoetida|bay leaf|nutmeg|saffron|fennel|anise|dill|mint|basil|thyme|oregano|rosemary|parsley|curry leaf|curry powder|garam masala/i },
    // Healthy Oils
    { label: 'Healthy Oils', regex: /olive oil|coconut oil|sesame oil|mustard oil|sunflower oil|flaxseed oil|groundnut oil/i },
    // Lean Meats & Fish
    { label: 'Lean Meats & Fish', regex: /chicken breast|chicken, broiler|turkey breast|\begg\b|salmon|tuna|sardine|mackerel|cod|tilapia|rohu|catla|pomfret|hilsa/i },
    // Non-alcoholic healthy beverages
    { label: 'Healthy Beverages', regex: /green tea|herbal tea|coconut water|buttermilk|turmeric milk|ginger tea/i },
];

// Revoke patterns: run AFTER all approvals to strip branded/processed items
// that slipped through due to keyword overlap.
const REVOKE_PATTERNS = [
    /pillsbury|betty crocker|kraft|heinz|campbell|kellogg|nestle|maggi|knorr/i,
    /pudding|jello|instant mix|dry mix|refrigerated dough|icing/i,
    /pan dulce|la ricura|salvadoran|apache indian|alaska native/i,
    /canned.*syrup|heavy syrup|light syrup/i,
    /self.rising|bolted.*flour.*added/i,
    /fast food|mcdonald|burger king|taco bell|subway|pizza hut|kfc/i,
    /baby food|infant formula/i,
    /wine|beer|liqueur|whiskey|vodka|rum|gin|daiquiri|pina colada|malt beverage/i,
    /protein supplement|protein powder|meal replacement|energy drink/i,
    /gravy|sauce mix|seasoning packet|bouillon/i,
];

async function curate() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    // Reset all to false (so re-runs are idempotent)
    await Food.updateMany({}, { isClinicApproved: false });
    console.log('🔄 Reset all isClinicApproved flags to false\n');

    // Phase 1: Approve by keyword group
    let totalApproved = 0;
    for (const { label, regex } of KEYWORD_GROUPS) {
        const result = await Food.updateMany(
            { name: { $regex: regex } },
            { $set: { isClinicApproved: true } }
        );
        console.log(`   ✓ ${label}: ${result.modifiedCount} foods approved`);
        totalApproved += result.modifiedCount;
    }

    // Phase 2: Revoke from clearly processed/packaged items
    console.log('\n🚫 Revoking approval from processed/packaged items...');
    let totalRevoked = 0;
    for (const pattern of REVOKE_PATTERNS) {
        const result = await Food.updateMany(
            { name: { $regex: pattern }, isClinicApproved: true },
            { $set: { isClinicApproved: false } }
        );
        if (result.modifiedCount > 0) {
            console.log(`   ✗ Revoked ${result.modifiedCount} foods matching ${pattern}`);
            totalRevoked += result.modifiedCount;
        }
    }
    console.log(`   Total revoked: ${totalRevoked}`);

    // Explicit targeted revokes for known problem foods
    await Food.updateMany(
        { name: { $regex: /cinnamon bun|honey bun|frosted.*bun/i } },
        { isClinicApproved: false }
    );
    await Food.updateMany(
        { name: { $regex: /uncle ben/i } },
        { isClinicApproved: false }
    );
    await Food.updateMany(
        { name: { $regex: /puffed.*cereal|cereal.*puffed|millet.*puffed|puffed.*millet/i } },
        { isClinicApproved: false }
    );
    await Food.updateMany(
        { name: { $regex: /parboiled.*dry|dry.*parboiled/i } },
        { isClinicApproved: false }
    );
    await Food.updateMany(
        { name: { $regex: /food distribution program/i } },
        { isClinicApproved: false }
    );

    // Remove cooking fats from snack-eligible pool by marking them non-approved
    // (they can stay in DB but shouldn't appear in generation)
    await Food.updateMany(
        { name: { $regex: /^butter|^ghee|^oil,|^oils,|margarine|shortening/i } },
        { isClinicApproved: false }
    );
    // Remove raw unprepared grains that aren't edible as-is
    await Food.updateMany(
        { name: { $regex: /,\s*raw,?\s*unenriched|,\s*raw,?\s*enriched|,\s*dry,?\s*|uncooked$/i } },
        { isClinicApproved: false }
    );
    // Remove puffed/extruded processed cereals  
    await Food.updateMany(
        { name: { $regex: /puffed|extruded|pre-cooked/i } },
        { isClinicApproved: false }
    );

    const approvedCount = await Food.countDocuments({ isClinicApproved: true });
    const totalCount = await Food.countDocuments();

    console.log('\n✅ Curation complete.');
    console.log(`   Approved foods: ${approvedCount}`);
    console.log(`   Total foods:    ${totalCount}`);

    await mongoose.disconnect();
}

curate().catch(err => {
    console.error('❌ Curation failed:', err.message);
    process.exit(1);
});
