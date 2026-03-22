import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../api/api';

const EditPatient = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        prakriti: 'Vata',
        dietaryPreference: 'Veg',
        digestionStrength: 'Medium',
        waterIntake: '',
        bowelMovement: 'Regular',
        // Optional body metrics
        weight: '',
        height: '',
        activityLevel: 'Sedentary',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await patientAPI.getById(id);
                const p = response.data.data;
                setFormData({
                    name: p.name || '',
                    age: p.age || '',
                    gender: p.gender || 'Male',
                    prakriti: p.prakriti || 'Vata',
                    dietaryPreference: p.dietaryPreference || 'Veg',
                    digestionStrength: p.digestionStrength || 'Medium',
                    waterIntake: p.waterIntake || '',
                    bowelMovement: p.bowelMovement || 'Regular',
                    weight: p.weight || '',
                    height: p.height || '',
                    activityLevel: p.activityLevel || 'Sedentary',
                });
            } catch (err) {
                setError('Failed to load patient data');
            } finally {
                setFetching(false);
            }
        };
        fetchPatient();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { setError('Full name is required.'); return; }
        if (!formData.age || formData.age < 1) { setError('A valid age is required.'); return; }
        if (!formData.waterIntake) { setError('Water intake is required.'); return; }

        setError('');
        setLoading(true);
        try {
            await patientAPI.update(id, {
                ...formData,
                age: parseInt(formData.age),
                waterIntake: parseFloat(formData.waterIntake),
                ...(formData.weight && { weight: parseFloat(formData.weight) }),
                ...(formData.height && { height: parseFloat(formData.height) }),
            });
            navigate(`/patients/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update patient');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        border: '1.5px solid #D0E4E8',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#141414',
        outline: 'none',
        background: '#fff',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        color: '#5F8190',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    if (fetching) {
        return (
            <div style={{ minHeight: '100vh', background: '#E2F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#5F8190', fontWeight: 500 }}>Loading patient...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#E2F0F0' }}>
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#36565F', margin: 0 }}>Edit Patient</h1>
                        <p style={{ fontSize: '14px', color: '#5F8190', marginTop: '4px' }}>Update patient clinical profile</p>
                    </div>
                    <button
                        onClick={() => navigate(`/patients/${id}`)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 16px', border: '1.5px solid #D0E4E8',
                            borderRadius: '8px', background: '#fff', cursor: 'pointer',
                            fontSize: '13px', color: '#5F8190', fontWeight: 500
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: '#FFF0F0', borderLeft: '4px solid #e53e3e',
                        padding: '12px 16px', borderRadius: '0 8px 8px 0',
                        marginBottom: '20px', color: '#c53030', fontSize: '14px', fontWeight: 500
                    }}>
                        {error}
                    </div>
                )}

                {/* Form Card */}
                <div style={{ background: '#fff', borderRadius: '14px', padding: '28px 32px', boxShadow: '0 2px 12px rgba(54,86,95,0.08)' }}>
                    <form onSubmit={handleSubmit} noValidate>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                            {/* Full Name — spans 2 cols */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Full Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="Patient's full name" />
                            </div>

                            {/* Age */}
                            <div>
                                <label style={labelStyle}>Age *</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} min="1" max="120" style={inputStyle} placeholder="Years" />
                            </div>

                            {/* Gender */}
                            <div>
                                <label style={labelStyle}>Gender *</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Prakriti */}
                            <div>
                                <label style={labelStyle}>Prakriti *</label>
                                <select name="prakriti" value={formData.prakriti} onChange={handleChange} style={inputStyle}>
                                    <option value="Vata">Vata</option>
                                    <option value="Pitta">Pitta</option>
                                    <option value="Kapha">Kapha</option>
                                    <option value="Vata-Pitta">Vata-Pitta</option>
                                    <option value="Pitta-Kapha">Pitta-Kapha</option>
                                    <option value="Vata-Kapha">Vata-Kapha</option>
                                </select>
                            </div>

                            {/* Dietary Preference */}
                            <div>
                                <label style={labelStyle}>Dietary Preference *</label>
                                <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange} style={inputStyle}>
                                    <option value="Veg">Vegetarian</option>
                                    <option value="Non-Veg">Non-Vegetarian</option>
                                </select>
                            </div>

                            {/* Digestion Strength */}
                            <div>
                                <label style={labelStyle}>Digestion Strength *</label>
                                <select name="digestionStrength" value={formData.digestionStrength} onChange={handleChange} style={inputStyle}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            {/* Water Intake */}
                            <div>
                                <label style={labelStyle}>Water Intake (L/day) *</label>
                                <input type="number" name="waterIntake" value={formData.waterIntake} onChange={handleChange} min="0" step="0.1" style={inputStyle} placeholder="e.g. 2.5" />
                            </div>

                            {/* Bowel Movement */}
                            <div>
                                <label style={labelStyle}>Bowel Movement *</label>
                                <select name="bowelMovement" value={formData.bowelMovement} onChange={handleChange} style={inputStyle}>
                                    <option value="Regular">Regular</option>
                                    <option value="Irregular">Irregular</option>
                                </select>
                            </div>

                            {/* Weight */}
                            <div>
                                <label style={labelStyle}>Weight (kg) <span style={{ fontWeight: 400, color: '#93b4bc' }}>optional</span></label>
                                <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="1" max="500" step="0.1" style={inputStyle} placeholder="e.g. 70" />
                            </div>

                            {/* Height */}
                            <div>
                                <label style={labelStyle}>Height (cm) <span style={{ fontWeight: 400, color: '#93b4bc' }}>optional</span></label>
                                <input type="number" name="height" value={formData.height} onChange={handleChange} min="30" max="300" step="0.5" style={inputStyle} placeholder="e.g. 170" />
                            </div>

                            {/* Activity Level */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Activity Level <span style={{ fontWeight: 400, color: '#93b4bc' }}>optional</span></label>
                                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} style={{ ...inputStyle, maxWidth: '340px' }}>
                                    <option value="Sedentary">Sedentary (little or no exercise)</option>
                                    <option value="LightlyActive">Lightly Active (1–3 days/week)</option>
                                    <option value="ModeratelyActive">Moderately Active (3–5 days/week)</option>
                                    <option value="VeryActive">Very Active (6–7 days/week)</option>
                                    <option value="ExtraActive">Extra Active (athlete / physical job)</option>
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2F0F0' }}>
                            <button
                                type="button"
                                onClick={() => navigate(`/patients/${id}`)}
                                style={{
                                    flex: 1, padding: '11px', border: '1.5px solid #D0E4E8',
                                    borderRadius: '8px', background: 'transparent',
                                    color: '#5F8190', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 2, padding: '11px', border: 'none',
                                    borderRadius: '8px',
                                    background: loading ? '#93b4bc' : '#36565F',
                                    color: '#fff', fontSize: '14px', fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditPatient;
