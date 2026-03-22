import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dietAPI, foodAPI } from '../api/api';
import FoodSearchDropdown from '../components/FoodSearchDropdown';

// Frontend local getRDATargets (mirrors backend rdaTargets.js)
const getRDATargets = (age, gender) => {
    const isMale = gender === 'Male';
    if (age < 12) return { calories: 1690, protein: 29, iron: 9, calcium: 600, vitaminC: 40, fiber: 25 };
    if (age >= 60) return isMale
        ? { calories: 2000, protein: 54, iron: 17, calcium: 600, vitaminC: 40, fiber: 40 }
        : { calories: 1900, protein: 46, iron: 21, calcium: 1200, vitaminC: 40, fiber: 40 };
    return isMale
        ? { calories: 2730, protein: 54, iron: 17, calcium: 600, vitaminC: 40, fiber: 40 }
        : { calories: 2230, protein: 46, iron: 21, calcium: 600, vitaminC: 40, fiber: 40 };
};

const MEAL_ORDER = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅', isSnack: false },
    { key: 'midMorningSnack', label: 'Mid-Morning Snack', icon: '🍎', isSnack: true },
    { key: 'lunch', label: 'Lunch', icon: '☀️', isSnack: false },
    { key: 'eveningSnack', label: 'Evening Snack', icon: '🍚', isSnack: true },
    { key: 'dinner', label: 'Dinner', icon: '🌙', isSnack: false },
];

const MICRO_KEYS = ['iron', 'calcium', 'vitaminC', 'vitaminD', 'vitaminB12', 'zinc', 'magnesium', 'omega3', 'folate', 'potassium', 'sodium'];

const recomputeNutrition = (slots, foodMap) => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    MICRO_KEYS.forEach(k => { totals[k] = 0; });
    MEAL_ORDER.forEach(({ key }) => {
        (slots[key] || []).forEach(item => {
            const f = foodMap[item.foodItem?._id || item.foodItem];
            if (!f) return;
            const mult = (item.portionSize || 100) / 100;
            totals.calories += (f.energy || 0) * mult;
            totals.protein += (f.protein || 0) * mult;
            totals.carbs += (f.carbs || 0) * mult;
            totals.fat += (f.fat || 0) * mult;
            totals.fiber += (f.fiber || 0) * mult;
            MICRO_KEYS.forEach(k => { totals[k] += (f[k] || 0) * mult; });
        });
    });
    Object.keys(totals).forEach(k => { totals[k] = Math.round(totals[k] * 10) / 10; });
    return totals;
};

const EditDietPage = () => {
    const { dietChartId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Meal state: { breakfast: [{foodItem: <fullDoc>, quantity}], ... }
    const [slots, setSlots] = useState({
        breakfast: [], midMorningSnack: [], lunch: [], eveningSnack: [], dinner: []
    });
    const [editNotes, setEditNotes] = useState('');
    const [patient, setPatient] = useState(null);
    const [allFoods, setAllFoods] = useState([]);
    const [foodMap, setFoodMap] = useState({});
    const [nutrition, setNutrition] = useState(null);

    useEffect(() => {
        load();
    }, [dietChartId]);

    const load = async () => {
        try {
            setLoading(true);
            const [dcRes, foodRes] = await Promise.all([
                dietAPI.getDietById(dietChartId),
                foodAPI.getAll({ isClinicApproved: 'true' })
            ]);

            const chart = dcRes.data.data;

            // Build food lookup map
            const map = {};
            (foodRes.data.data || []).forEach(f => { map[f._id] = f; });
            setFoodMap(map);
            setAllFoods(foodRes.data.data || []);

            // Populate slot state — foodItem is already populated by backend
            const toSlot = (arr) => (arr || []).map(item => ({
                foodItem: typeof item.foodItem === 'object' ? item.foodItem : map[item.foodItem],
                quantity: item.quantity || '1 serving',
                portionSize: item.portionSize
            }));
            const initialSlots = {
                breakfast: toSlot(chart.breakfast),
                midMorningSnack: toSlot(chart.midMorningSnack),
                lunch: toSlot(chart.lunch),
                eveningSnack: toSlot(chart.eveningSnack),
                dinner: toSlot(chart.dinner),
            };
            setSlots(initialSlots);
            setEditNotes(chart.doctorNotes || '');
            // patient is populated directly on the chart document
            setPatient(chart.patient);
            setNutrition(recomputeNutrition(initialSlots, map));
        } catch (err) {
            setError('Failed to load diet chart. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const addFood = (slotKey, foodId) => {
        if (!foodId) return;
        const food = foodMap[foodId];
        if (!food) return;
        const updated = {
            ...slots,
            [slotKey]: [...(slots[slotKey] || []), { foodItem: food, quantity: '1 serving' }]
        };
        setSlots(updated);
        setNutrition(recomputeNutrition(updated, foodMap));
    };

    const removeFood = (slotKey, index) => {
        const updated = {
            ...slots,
            [slotKey]: (slots[slotKey] || []).filter((_, i) => i !== index)
        };
        setSlots(updated);
        setNutrition(recomputeNutrition(updated, foodMap));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const fmtSlot = (arr) => (arr || []).map(item => ({
                foodItem: item.foodItem?._id || item.foodItem,
                quantity: item.quantity || '1 serving',
                ...(item.portionSize !== undefined && { portionSize: item.portionSize })
            }));
            await dietAPI.editDiet(dietChartId, {
                breakfast: fmtSlot(slots.breakfast),
                midMorningSnack: fmtSlot(slots.midMorningSnack),
                lunch: fmtSlot(slots.lunch),
                eveningSnack: fmtSlot(slots.eveningSnack),
                dinner: fmtSlot(slots.dinner),
                editNotes
            });
            setSuccess('Diet chart saved successfully!');
            setTimeout(() => navigate(`/diet/${dietChartId}`), 1200);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#E2F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#5F8190', fontWeight: 500 }}>Loading diet chart…</p>
        </div>
    );

    const rdaData = patient?.age ? getRDATargets(patient.age, patient.gender) : null;

    return (
        <div style={{ minHeight: '100vh', background: '#E2F0F0', padding: '40px 24px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#36565F', margin: 0 }}>Edit Diet Chart</h1>
                        {patient && (
                            <p style={{ fontSize: '14px', color: '#5F8190', margin: '6px 0 0' }}>
                                {patient.name} · {patient.age}y · {patient.gender} · {patient.prakriti}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => navigate(-1)} style={ghostBtn}>← Back</button>
                        <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, background: saving ? '#93b4bc' : '#36565F', cursor: saving ? 'not-allowed' : 'pointer' }}>
                            {saving ? 'Saving…' : '✓ Save Changes'}
                        </button>
                    </div>
                </div>

                {error && <div style={errorBanner}>{error}</div>}
                {success && <div style={successBanner}>{success}</div>}

                {/* Meal Slots */}
                {MEAL_ORDER.map(({ key, label, icon, isSnack }) => {
                    const items = slots[key] || [];
                    const cardStyle = isSnack
                        ? { ...card, background: '#FFFBF2', border: '1px solid rgba(180,131,0,0.18)' }
                        : card;
                    return (
                        <div key={key} style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '20px' }}>{icon}</span>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: isSnack ? '#92610a' : '#36565F', margin: 0 }}>{label}</h3>
                                {isSnack && <span style={{ fontSize: '11px', color: '#92610a', background: 'rgba(180,131,0,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>snack</span>}
                                <span style={{ fontSize: '12px', color: '#5F8190', marginLeft: 'auto' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div style={{ height: '1px', background: '#E2F0F0', marginBottom: '14px' }} />

                            {items.length === 0 && <p style={{ color: '#93b4bc', fontSize: '13px', fontStyle: 'italic' }}>No foods added.</p>}

                            {items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < items.length - 1 ? '1px solid #EEF5F5' : 'none' }}>
                                    <div>
                                        <span style={{ fontWeight: 500, color: '#141414', fontSize: '14px' }}>{item.foodItem?.name || '—'}</span>
                                        <span style={{ color: '#5F8190', fontSize: '12px', marginLeft: '8px' }}>{item.quantity}</span>
                                    </div>
                                    <button onClick={() => removeFood(key, i)} style={removeBtn}>Remove</button>
                                </div>
                            ))}

                            {/* Add food dropdown */}
                            <div style={{ marginTop: '14px' }}>
                                <FoodSearchDropdown 
                                    foods={allFoods} 
                                    onSelect={(foodId) => addFood(key, foodId)} 
                                    placeholder="+ Add food item..."
                                    mealType={isSnack ? 'Snack' : ''}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* Edit Notes */}
                <div style={card}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#36565F', margin: '0 0 12px' }}>Edit Notes</h3>
                    <textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        rows={3}
                        placeholder="Reason for edit or clinical notes…"
                        style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #D0E4E8', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                    />
                </div>

                {/* Nutrition Summary */}
                {nutrition && (
                    <div style={card}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#36565F', margin: '0 0 16px' }}>Nutrition Summary (live)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Calories', unit: 'kcal', val: nutrition.calories },
                                { label: 'Protein', unit: 'g', val: nutrition.protein },
                                { label: 'Carbs', unit: 'g', val: nutrition.carbs },
                                { label: 'Fat', unit: 'g', val: nutrition.fat },
                                { label: 'Fiber', unit: 'g', val: nutrition.fiber },
                            ].map(({ label, unit, val }) => (
                                <div key={label} style={{ background: '#F5FAFA', padding: '14px 10px', borderRadius: '10px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#36565F', margin: '0 0 4px' }}>{val?.toFixed(1) || '0'}</p>
                                    <p style={{ fontSize: '11px', color: '#5F8190', margin: 0 }}>{label} <span style={{ color: '#93b4bc' }}>{unit}</span></p>
                                </div>
                            ))}
                        </div>

                        {/* RDA Comparison */}
                        {rdaData && (
                            <div style={{ marginTop: '20px' }}>
                                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.6px', color: '#5F8190', textTransform: 'uppercase', marginBottom: '12px' }}>
                                    ICMR RDA Comparison
                                </p>
                                {[
                                    { label: 'Calories', unit: 'kcal', target: rdaData.calories, achieved: nutrition.calories },
                                    { label: 'Protein', unit: 'g', target: rdaData.protein, achieved: nutrition.protein },
                                    { label: 'Fiber', unit: 'g', target: rdaData.fiber, achieved: nutrition.fiber },
                                    { label: 'Iron', unit: 'mg', target: rdaData.iron, achieved: nutrition.iron },
                                    { label: 'Calcium', unit: 'mg', target: rdaData.calcium, achieved: nutrition.calcium },
                                    { label: 'Vitamin C', unit: 'mg', target: rdaData.vitaminC, achieved: nutrition.vitaminC },
                                ].map(({ label, unit, target, achieved }) => {
                                    const pct = Math.min(Math.round((achieved / target) * 100), 100) || 0;
                                    const color = pct >= 80 ? '#2f9e6c' : pct >= 50 ? '#d97706' : '#e53e3e';
                                    return (
                                        <div key={label} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '12px', color: '#36565F' }}>{label}</span>
                                                <span style={{ fontSize: '12px', color: '#5F8190' }}>{Math.round(achieved)} / {target} {unit} <span style={{ fontWeight: 700, color }}>{pct}%</span></span>
                                            </div>
                                            <div style={{ height: '6px', background: '#E2F0F0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '10px', transition: 'width 0.3s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Save */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, fontSize: '14px', padding: '12px 28px', boxShadow: '0 4px 16px rgba(54,86,95,0.28)', cursor: saving ? 'not-allowed' : 'pointer', background: saving ? '#93b4bc' : '#36565F' }}>
                        {saving ? 'Saving…' : '✓ Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* Styles */
const card = {
    background: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '20px'
};
const primaryBtn = {
    padding: '10px 20px', background: '#36565F', border: 'none',
    borderRadius: '8px', color: '#fff', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
};
const ghostBtn = {
    padding: '10px 16px', border: '1px solid #5F8190', borderRadius: '8px',
    background: 'transparent', color: '#36565F', fontSize: '13px',
    fontWeight: 500, cursor: 'pointer'
};
const removeBtn = {
    padding: '4px 10px', fontSize: '12px', fontWeight: 500,
    background: 'transparent', border: '1px solid #E0B4B4',
    color: '#B54A4A', borderRadius: '6px', cursor: 'pointer', flexShrink: 0
};
const selectStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px dashed #B0CCCC', background: '#F8FBFB',
    fontSize: '13px', color: '#5F8190', cursor: 'pointer', outline: 'none'
};
const errorBanner = {
    background: '#FFF0F0', borderLeft: '4px solid #e53e3e',
    padding: '12px 16px', borderRadius: '0 8px 8px 0',
    marginBottom: '20px', color: '#c53030', fontSize: '14px', fontWeight: 500
};
const successBanner = {
    background: '#F0FFF4', borderLeft: '4px solid #2f9e6c',
    padding: '12px 16px', borderRadius: '0 8px 8px 0',
    marginBottom: '20px', color: '#276749', fontSize: '14px', fontWeight: 500
};

export default EditDietPage;
