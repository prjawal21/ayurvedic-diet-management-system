import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AddFoodPage = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category: 'Vegetable',
        meal_type: 'All',
        dosha_suitable: 'Tridosha',
        agni_level: 'Medium',
        virya: 'Warming',
        energy: '',       // The DB schema expects `energy`
        calories: '',     // The backend controller expects `calories` (we will send both to be safe)
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        glycemic_index: '',
        digestibility: 'Medium',
        source: 'Custom',
        isClinicApproved: true // default to approved for custom foods
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const up = { ...prev, [name]: value };
            if (name === 'energy') up.calories = value;
            return up;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        
        try {
            // Clean up empty optional fields
            const payload = { ...formData };

            await api.post('/api/foods', payload);
            
            setSuccess('Food item added successfully!');
            setTimeout(() => {
                navigate(-1);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to add food');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#E2F0F0', padding: '40px 24px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <h1 style={{ fontSize: '24px', color: '#36565F', marginBottom: '20px', fontWeight: 700 }}>Add Custom Food</h1>
                
                {error && <div style={{ background: '#FFF0F0', color: '#c53030', padding: '12px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #e53e3e' }}>{error}</div>}
                {success && <div style={{ background: '#F0FFF4', color: '#276749', padding: '12px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #2f9e6c' }}>{success}</div>}
                
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    
                    <div>
                        <h3 style={{ fontSize: '16px', color: '#36565F', borderBottom: '1px solid #EEF5F5', paddingBottom: '8px', marginBottom: '12px' }}>Basic Info</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Food Name *</label>
                                <input required name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="e.g. Quinoa" />
                            </div>
                            <div>
                                <label style={labelStyle}>Category *</label>
                                <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                                    {['Grain', 'Vegetable', 'Fruit', 'Dairy', 'Legume', 'Fat', 'Nut', 'Seed', 'Spice', 'Herb'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Meal Type *</label>
                                <select name="meal_type" value={formData.meal_type} onChange={handleChange} style={inputStyle}>
                                    {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'All'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '16px', color: '#36565F', borderBottom: '1px solid #EEF5F5', paddingBottom: '8px', marginBottom: '12px' }}>Nutrition (per 100g)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Energy / Calories (kcal) *</label>
                                <input required type="number" step="0.1" name="energy" value={formData.energy} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Protein (g) *</label>
                                <input required type="number" step="0.1" name="protein" value={formData.protein} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Carbs (g) *</label>
                                <input required type="number" step="0.1" name="carbs" value={formData.carbs} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Fat (g) *</label>
                                <input required type="number" step="0.1" name="fat" value={formData.fat} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Fiber (g) *</label>
                                <input required type="number" step="0.1" name="fiber" value={formData.fiber} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Glycemic Index (0-100) *</label>
                                <input required type="number" step="1" name="glycemic_index" value={formData.glycemic_index} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '16px', color: '#36565F', borderBottom: '1px solid #EEF5F5', paddingBottom: '8px', marginBottom: '12px' }}>Ayurvedic Profile</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Virya (Potency) *</label>
                                <select name="virya" value={formData.virya} onChange={handleChange} style={inputStyle}>
                                    <option value="Warming">Warming (Ushna)</option>
                                    <option value="Cooling">Cooling (Sheeta)</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Suitable Dosha *</label>
                                <select name="dosha_suitable" value={formData.dosha_suitable} onChange={handleChange} style={inputStyle}>
                                    {['Vata', 'Pitta', 'Kapha', 'Dual', 'Tridosha'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Agni Required *</label>
                                <select name="agni_level" value={formData.agni_level} onChange={handleChange} style={inputStyle}>
                                    <option value="Low">Low (Manda)</option>
                                    <option value="Medium">Medium (Sama)</option>
                                    <option value="High">High (Tikshna)</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Digestibility *</label>
                                <select name="digestibility" value={formData.digestibility} onChange={handleChange} style={inputStyle}>
                                    <option value="Heavy">Heavy (Guru)</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Light">Light (Laghu)</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Rasa (Taste) *</label>
                                <select name="rasa" value={formData.rasa} onChange={handleChange} style={inputStyle}>
                                    {['Madhura', 'Amla', 'Lavana', 'Katu', 'Tikta', 'Kashaya'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="button" onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #5F8190', background: 'transparent', color: '#36565F', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: saving ? '#93b4bc' : '#36565F', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>{saving ? 'Adding...' : 'Add Food'}</button>
                    </div>

                </form>
            </div>
        </div>
    );
};

const labelStyle = { display: 'block', fontSize: '13px', color: '#5F8190', marginBottom: '6px', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D0E4E8', outline: 'none', boxSizing: 'border-box', fontSize: '14px', color: '#141414', background: '#F8FBFB' };

export default AddFoodPage;
