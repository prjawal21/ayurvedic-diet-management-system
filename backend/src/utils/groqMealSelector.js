const OpenAI = require('openai');

async function selectMealsWithGrok(patientContext, mealCandidates, season) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'PASTE_YOUR_GROQ_KEY_HERE' || process.env.GROQ_API_KEY === 'your_actual_groq_key_here') {
            console.warn('⚠️ GROQ_API_KEY not configured. Skipping AI selection.');
            return null;
        }

        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://api.groq.com/openai/v1',
        });

        const systemPrompt = `You are an Ayurvedic clinical dietitian. Select appropriate foods for each meal slot based on the patient's prakriti, season, and Ayurvedic principles. Respond only with valid JSON structured exactly like {"breakfast":["id1"],"midMorningSnack":["id2"],"lunch":["id3"],"eveningSnack":["id4"],"dinner":["id5"],"reasoning":"..."}. Snack slots must contain only whole fruits, nuts, or raw vegetables — never fats, oils, dairy, grains, or spices.`;

        const slim = (foods) => foods.slice(0, 20).map(f => `[id: ${f._id}, ${f.name}, ${f.rasa?.length ? f.rasa.join(', ') : 'Unknown'}, ${f.virya || 'Unknown'}]`).join(', ');

        const userPrompt = `Patient Profile:
Name: ${patientContext.name}
Gender: ${patientContext.gender}
Prakriti: ${patientContext.prakriti}
Agni: ${patientContext.digestionStrength}
Dietary Preference: ${patientContext.dietaryPreference}
Conditions: ${(patientContext.conditions || []).map(c => c.name || c).join(', ') || 'None'}
Season: ${season || 'Unknown'}

Candidate Foods:
Breakfast: ${slim(mealCandidates.breakfast)}
Mid-Morning Snack: ${slim(mealCandidates.midMorningSnack)}
IMPORTANT: For Mid-Morning Snack and Evening Snack, ONLY select fruits, nuts, or raw vegetables. 
Do NOT select: ghee, oils, butter, cream, milk, grains, dal, or spices for snack slots.
Valid snack examples: apple, banana, pomegranate, almonds, cashews, cucumber, papaya, dates.

Lunch: ${slim(mealCandidates.lunch)}

Evening Snack: ${slim(mealCandidates.eveningSnack)}
IMPORTANT: For Mid-Morning Snack and Evening Snack, ONLY select fruits, nuts, or raw vegetables. 
Do NOT select: ghee, oils, butter, cream, milk, grains, dal, or spices for snack slots.
Valid snack examples: apple, banana, pomegranate, almonds, cashews, cucumber, papaya, dates.

Dinner: ${slim(mealCandidates.dinner)}

STRICT RULES — you must follow these exactly:
1. Select EXACTLY 2-3 foods for Breakfast (not 1, not 0)
2. Select EXACTLY 1-2 foods for Mid-Morning Snack
3. Select EXACTLY 2-3 foods for Lunch (not 1, not 0)  
4. Select EXACTLY 1-2 foods for Evening Snack
5. Select EXACTLY 2-3 foods for Dinner (REQUIRED — never leave dinner empty)
6. Snacks must be whole edible foods only — fruits, nuts, seeds, vegetables. Never select oils, spices, or raw grains as snacks.
7. Never select cooking oils (coconut oil, sesame oil, mustard oil) as standalone meal items — these are condiments only
8. Never select raw spices (coriander seeds, cumin, turmeric) as standalone snack items — these are condiments only
9. Every meal slot must have at least the minimum number of foods — if you cannot find enough suitable candidates, pick the best available options
10. Vary the food types across meals — do not repeat the same food category in consecutive meals

You MUST return all 5 keys in your JSON response: breakfast, midMorningSnack, lunch, eveningSnack, dinner.
Each must contain an array of food IDs — never an empty array.
If dinner candidates seem limited, pick the best available whole foods from the list regardless of perfect dosha match.`;

        console.log(`🧠 Calling Groq API (${model}) for meal selection...`);
        
        const completion = await client.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3, // Low temperature for more deterministic clinical choices
            max_tokens: 1000
        });

        const responseText = completion.choices[0].message.content.trim();
        
        // Try to parse JSON. Sometimes LLMs still wrap in ```json ... ```
        let jsonStr = responseText;
        if (jsonStr.startsWith('\`\`\`json')) {
            jsonStr = jsonStr.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (jsonStr.startsWith('\`\`\`')) {
            jsonStr = jsonStr.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const parsed = JSON.parse(jsonStr);
        
        // Validate minimum foods per slot — return null to trigger fallback if any slot is under minimum
        const minimums = { breakfast: 2, midMorningSnack: 1, lunch: 2, eveningSnack: 1, dinner: 2 };
        for (const [slot, min] of Object.entries(minimums)) {
            const slotFoods = parsed[slot];
            if (!Array.isArray(slotFoods) || slotFoods.length < min) {
                console.warn(`⚠️ Groq returned insufficient foods for ${slot}: got ${Array.isArray(slotFoods) ? slotFoods.length : 'missing'}, need ${min}. Triggering fallback.`);
                return null;
            }
        }
        console.log('✅ Slot validation passed.');

        // Validate IDs against candidates to prevent hallucination
        const validPlan = {
            breakfast: parsed.breakfast.filter(id => mealCandidates.breakfast.some(f => f._id.toString() === id.toString())),
            midMorningSnack: (parsed.midMorningSnack || []).filter(id => mealCandidates.midMorningSnack.some(f => f._id.toString() === id.toString())),
            lunch: parsed.lunch.filter(id => mealCandidates.lunch.some(f => f._id.toString() === id.toString())),
            eveningSnack: (parsed.eveningSnack || []).filter(id => mealCandidates.eveningSnack.some(f => f._id.toString() === id.toString())),
            dinner: parsed.dinner.filter(id => mealCandidates.dinner.some(f => f._id.toString() === id.toString())),
            reasoning: parsed.reasoning || 'Groq AI Selection'
        };

        console.log('✅ Groq meal selection successful.');
        console.log('   Reasoning:', validPlan.reasoning);
        return validPlan;

    } catch (error) {
        console.error('Groq API error — full details:');
        console.error('Message:', error.message);
        console.error('Status:', error.status);
        console.error('Response:', error.response?.data || error.response);
        return null;
    }
}

module.exports = {
    selectMealsWithGrok
};
