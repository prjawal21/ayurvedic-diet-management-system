import React, { useState, useEffect } from 'react';
import { dietAPI, foodAPI } from '../api/api';
import FoodSearchDropdown from './FoodSearchDropdown';

/* ── Meal icons ──────────────────────────────────────────── */
const MEAL_META = {
    breakfast: { label: 'Breakfast', icon: '🌅', isSnack: false },
    midMorningSnack: { label: 'Mid-Morning Snack', icon: '🍎', isSnack: true },
    lunch: { label: 'Lunch', icon: '☀️', isSnack: false },
    eveningSnack: { label: 'Evening Snack', icon: '🍚', isSnack: true },
    dinner: { label: 'Dinner', icon: '🌙', isSnack: false },
};

const DietResultView = ({ visit, patient, dietPlan: initialDietPlan, onBack, onSaved }) => {
    const [dietPlan, setDietPlan] = useState(initialDietPlan);
    const [allFoods, setAllFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overrides, setOverrides] = useState([]);
    const [doctorNotes, setDoctorNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [nutrition, setNutrition] = useState(initialDietPlan?.totalNutrients || {});
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadFoods();
        setLoading(false);
    }, []);

    const loadFoods = async () => {
        try {
            const response = await foodAPI.getAll();
            setAllFoods(response.data.data);
        } catch (err) {
            console.error('Failed to load foods:', err);
        }
    };

    const calculateNutrition = (meals) => {
        const microKeys = ['iron', 'calcium', 'vitaminC', 'vitaminD', 'vitaminB12', 'zinc', 'magnesium', 'omega3', 'folate', 'potassium', 'sodium'];
        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        microKeys.forEach(k => { totals[k] = 0; });

        ['breakfast', 'midMorningSnack', 'lunch', 'eveningSnack', 'dinner'].forEach(mealType => {
            if (meals[mealType]) {
                meals[mealType].forEach(item => {
                    const f = item.foodItem;
                    if (!f) return;
                    const mult = (f.portionSize || 100) / 100;
                    totals.calories += (f.energy || 0) * mult;
                    totals.protein += (f.protein || 0) * mult;
                    totals.carbs += (f.carbs || 0) * mult;
                    totals.fat += (f.fat || 0) * mult;
                    totals.fiber += (f.fiber || 0) * mult;
                    microKeys.forEach(k => { totals[k] += (f[k] || 0) * mult; });
                });
            }
        });
        return totals;
    };

    const checkViruddhaAhara = (meal, newFood) => {
        const currentFoods = dietPlan.dietPlan[meal] || [];
        const incompatiblePairs = [
            { food1: 'Banana', food2: 'Cow Milk', reason: 'Banana and milk together create toxins (ama) and disturb gut flora' },
            { food1: 'Milk', food2: 'Fish', reason: 'Milk and fish are antagonistic and can cause skin disorders' },
            { food1: 'Milk', food2: 'Salt', reason: 'Milk and salt together can cause skin diseases' },
            { food1: 'Honey', food2: 'Ghee', reason: 'Equal quantities of honey and ghee are toxic' },
            { food1: 'Yogurt', food2: 'Milk', reason: 'Yogurt and milk together are difficult to digest' },
            { food1: 'Yogurt', food2: 'Banana', reason: 'Yogurt and banana can diminish digestive fire' },
        ];
        for (const item of currentFoods) {
            const existingFoodName = item.foodItem.name;
            const newFoodName = newFood.name;
            for (const pair of incompatiblePairs) {
                if (
                    (existingFoodName.includes(pair.food1) && newFoodName.includes(pair.food2)) ||
                    (existingFoodName.includes(pair.food2) && newFoodName.includes(pair.food1))
                ) {
                    return { incompatible: true, reason: pair.reason, foods: [pair.food1, pair.food2] };
                }
            }
        }
        return { incompatible: false };
    };

    const handleAddFood = (meal, foodId) => {
        const food = allFoods.find(f => f._id === foodId);
        if (!food) return;
        const validation = checkViruddhaAhara(meal, food);
        if (validation.incompatible) {
            const confirmed = window.confirm(
                `⚠️ VIRUDDHA AHARA WARNING\n\nAdding "${food.name}" creates an incompatible combination:\n\n${validation.foods.join(' + ')}\n\nReason: ${validation.reason}\n\nThis violates Ayurvedic principles. Override anyway?`
            );
            if (!confirmed) return;
        }
        const newMeal = [...(dietPlan.dietPlan[meal] || []), { foodItem: food, quantity: '1 serving' }];
        const updatedDietPlan = { ...dietPlan, dietPlan: { ...dietPlan.dietPlan, [meal]: newMeal } };
        setDietPlan(updatedDietPlan);
        setNutrition(calculateNutrition(updatedDietPlan.dietPlan));
        setSaved(false);
        setOverrides([...overrides, {
            meal, action: 'add', replacementFood: foodId,
            reason: validation.incompatible ? `Doctor override (Viruddha Ahara: ${validation.reason})` : 'Doctor added',
            safetyOverride: validation.incompatible
        }]);
    };

    const handleRemoveFood = (meal, index) => {
        const removedFood = dietPlan.dietPlan[meal][index];
        const newMeal = dietPlan.dietPlan[meal].filter((_, i) => i !== index);
        const updatedDietPlan = { ...dietPlan, dietPlan: { ...dietPlan.dietPlan, [meal]: newMeal } };
        setDietPlan(updatedDietPlan);
        setNutrition(calculateNutrition(updatedDietPlan.dietPlan));
        setSaved(false);
        setOverrides([...overrides, { meal, action: 'remove', originalFood: removedFood.foodItem._id, reason: 'Doctor removed' }]);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formatMeal = (items) => items.map(item => ({
                foodItem: item.foodItem._id || item.foodItem,
                quantity: item.quantity || '1 serving',
            }));
            const payload = {
                visitId: visit._id,
                dietPlan: {
                    breakfast: formatMeal(dietPlan.dietPlan.breakfast || []),
                    midMorningSnack: formatMeal(dietPlan.dietPlan.midMorningSnack || []),
                    lunch: formatMeal(dietPlan.dietPlan.lunch || []),
                    eveningSnack: formatMeal(dietPlan.dietPlan.eveningSnack || []),
                    dinner: formatMeal(dietPlan.dietPlan.dinner || []),
                    totalNutrients: nutrition,
                    ayurvedaAttributes: dietPlan.ayurvedaAttributes || {},
                    complianceNotes: dietPlan.complianceNotes || [],
                },
                doctorNotes,
                overrides,
            };
            console.log('Saving diet with payload:', payload);
            const response = await dietAPI.saveDiet(payload);
            console.log('Save response:', response);
            setSaved(true);
            alert(`✅ Diet chart saved successfully!\n\nVersion: ${response.data.dietChart.version}\nID: ${response.data.dietChart._id}`);
            onSaved();
        } catch (err) {
            console.error('Save error:', err);
            const errorMsg = err.response?.data?.message || err.message;
            alert(`❌ Failed to save diet:\n\n${errorMsg}\n\nPlease check console for details.`);
        } finally {
            setSaving(false);
        }
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#E2F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#5F8190', fontWeight: 500 }}>Loading diet plan...</p>
            </div>
        );
    }

    /* ── Error state ── */
    if (!dietPlan || !dietPlan.success) {
        const errorMessage = dietPlan?.message || 'Failed to generate diet plan';
        return (
            <div style={{ minHeight: '100vh', background: '#E2F0F0', padding: '40px 24px' }}>
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                    <div style={{ ...cardStyle, borderLeft: '4px solid #e53e3e' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#c53030', margin: '0 0 12px' }}>
                            Diet Plan Generation Failed
                        </h2>
                        <p style={{ fontSize: '14px', color: '#5F8190', marginBottom: '24px' }}>{errorMessage}</p>
                        <button onClick={onBack} style={primaryBtn}
                            onMouseEnter={e => e.currentTarget.style.background = '#2b454d'}
                            onMouseLeave={e => e.currentTarget.style.background = '#36565F'}>
                            ← Back to Form
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Main Editor ── */
    return (
        <div style={{ minHeight: '100vh', background: '#E2F0F0', padding: '40px 24px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* ── Page Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#36565F', margin: 0 }}>
                                Diet Plan
                            </h1>
                            {!saved && (
                                <span style={{
                                    fontSize: '12px', fontWeight: 600,
                                    background: 'rgba(229,115,0,0.1)', color: '#b45309',
                                    padding: '3px 10px', borderRadius: '20px',
                                    border: '1px solid rgba(229,115,0,0.2)',
                                }}>Draft</span>
                            )}
                        </div>
                        <p style={{ fontSize: '14px', color: '#5F8190', margin: '6px 0 0' }}>
                            {patient?.name} · {visit?.visitDate
                                ? new Date(visit.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : ''}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={onBack}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '10px 16px', border: '1px solid #5F8190',
                                borderRadius: '8px', background: 'transparent',
                                color: '#36565F', fontSize: '13px', fontWeight: 500,
                                cursor: 'pointer', transition: 'background 0.18s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(95,129,144,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                ...primaryBtn,
                                background: saving ? '#93b4bc' : '#36565F',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}
                            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#2b454d'; }}
                            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#36565F'; }}
                        >
                            {saving && (
                                <svg style={{ width: '15px', height: '15px', animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                                    <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {saving ? 'Saving...' : 'Save Diet Chart'}
                        </button>
                    </div>
                </div>

                {/* ── Override Notice ── */}
                {overrides.length > 0 && (
                    <div style={{
                        background: 'rgba(180,131,0,0.08)', border: '1px solid rgba(180,131,0,0.25)',
                        borderRadius: '8px', padding: '10px 16px', marginBottom: '20px',
                        fontSize: '13px', color: '#92610a', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        ⚠️ Nutrition recalculated after {overrides.length} doctor override{overrides.length > 1 ? 's' : ''}
                    </div>
                )}

                {/* ── Meal Cards ── */}
                {['breakfast', 'midMorningSnack', 'lunch', 'eveningSnack', 'dinner'].map((meal) => {
                    const { label, icon, isSnack } = MEAL_META[meal];
                    const items = dietPlan?.dietPlan?.[meal] || [];

                    // Snack cards get a warmer, lighter tint
                    const mealCardStyle = isSnack ? {
                        ...cardStyle,
                        background: '#FFFBF2',
                        border: '1px solid rgba(180,131,0,0.18)',
                        boxShadow: '0 2px 8px rgba(180,131,0,0.06)',
                    } : cardStyle;

                    return (
                        <div key={meal} style={mealCardStyle}>
                            {/* Meal Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '20px', lineHeight: 1 }}>{icon}</span>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: isSnack ? '#92610a' : '#36565F', margin: 0 }}>{label}</h3>
                                    <span style={{ fontSize: '12px', color: '#5F8190', background: '#F5FAFA', padding: '2px 8px', borderRadius: '20px' }}>
                                        {items.length} item{items.length !== 1 ? 's' : ''}
                                    </span>
                                    {isSnack && (
                                        <span style={{ fontSize: '11px', color: '#92610a', background: 'rgba(180,131,0,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>snack</span>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ height: '1px', background: '#E2F0F0', marginBottom: '14px' }} />

                            {/* Food Rows */}
                            {items.length === 0 ? (
                                <p style={{ color: '#5F8190', fontSize: '13px', padding: '8px 0', fontStyle: 'italic' }}>
                                    No items added yet.
                                </p>
                            ) : (
                                <div style={{ marginBottom: '14px' }}>
                                    {items.map((item, index) => {
                                        const hasOverride = overrides.some(o => o.meal === meal);
                                        return (
                                            <div key={index} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '10px 0',
                                                borderBottom: index < items.length - 1 ? '1px solid #EEF5F5' : 'none',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '6px', height: '6px', borderRadius: '50%',
                                                        background: '#5F8190', flexShrink: 0,
                                                    }} />
                                                    <div>
                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#141414' }}>
                                                            {item.foodItem.name}
                                                        </span>
                                                        <span style={{ fontSize: '13px', color: '#5F8190', marginLeft: '8px' }}>
                                                            {item.quantity}
                                                        </span>
                                                    </div>
                                                    {hasOverride && (
                                                        <span style={{
                                                            fontSize: '11px', fontWeight: 600,
                                                            background: 'rgba(180,131,0,0.1)', color: '#92610a',
                                                            padding: '2px 8px', borderRadius: '20px',
                                                        }}>
                                                            Override
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFood(meal, index)}
                                                    style={{
                                                        padding: '4px 10px', fontSize: '12px', fontWeight: 500,
                                                        background: 'transparent',
                                                        border: '1px solid #E0B4B4',
                                                        color: '#B54A4A',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s',
                                                        flexShrink: 0,
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#B54A4A'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B54A4A'; }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Add Food Control */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: items.length > 0 ? '12px' : '0' }}>
                                <FoodSearchDropdown 
                                    foods={allFoods} 
                                    onSelect={(foodId) => handleAddFood(meal, foodId)} 
                                    placeholder="+ Add food item..."
                                    mealType={isSnack ? 'Snack' : ''}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* ── Nutrition Summary Card ── */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#36565F', margin: '0 0 18px' }}>
                        Nutrition Summary
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '14px',
                    }}>
                        {[
                            { key: 'calories', label: 'Calories', unit: 'kcal', value: nutrition.calories },
                            { key: 'protein', label: 'Protein', unit: 'g', value: nutrition.protein },
                            { key: 'carbs', label: 'Carbs', unit: 'g', value: nutrition.carbs },
                            { key: 'fat', label: 'Fat', unit: 'g', value: nutrition.fat },
                            { key: 'fiber', label: 'Fiber', unit: 'g', value: nutrition.fiber },
                        ].map(({ key, label, unit, value }) => (
                            <div key={key} style={{
                                background: '#F5FAFA', padding: '16px 12px',
                                borderRadius: '10px', textAlign: 'center',
                            }}>
                                <p style={{ fontSize: '22px', fontWeight: 700, color: '#36565F', margin: '0 0 4px' }}>
                                    {value?.toFixed(1) || '0'}
                                </p>
                                <p style={{ fontSize: '11px', fontWeight: 500, color: '#5F8190', margin: 0 }}>
                                    {label}
                                </p>
                                <p style={{ fontSize: '11px', color: '#93B4BC', margin: '2px 0 0' }}>{unit}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Doctor Notes Card ── */}
                <div style={cardStyle}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#36565F', margin: '0 0 16px' }}>
                        Doctor Notes
                    </h3>
                    <textarea
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        rows={4}
                        placeholder="Add clinical notes, observations, or special instructions for this diet plan..."
                        style={{
                            width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                            borderRadius: '8px', border: '1px solid #D0E4E8',
                            background: '#FFFFFF', fontSize: '14px', color: '#141414',
                            outline: 'none', resize: 'vertical', lineHeight: 1.6,
                            fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#5F8190'; e.target.style.boxShadow = '0 0 0 3px rgba(95,129,144,0.18)'; }}
                        onBlur={e => { e.target.style.borderColor = '#D0E4E8'; e.target.style.boxShadow = 'none'; }}
                    />
                </div>

                {/* ── Sticky Bottom Save Bar ── */}
                <div style={{
                    position: 'sticky', bottom: '24px',
                    display: 'flex', justifyContent: 'flex-end',
                    marginTop: '8px',
                }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            ...primaryBtn,
                            background: saving ? '#93b4bc' : '#36565F',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 16px rgba(54,86,95,0.30)',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '12px 28px', fontSize: '14px',
                        }}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#2b454d'; }}
                        onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#36565F'; }}
                    >
                        {saving ? 'Saving...' : '✓ Save Diet Chart'}
                    </button>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div >
    );
};

/* ── Shared style objects ─────────────────────────────── */
const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    marginBottom: '20px',
};

const primaryBtn = {
    padding: '10px 20px',
    background: '#36565F',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
};

export default DietResultView;
