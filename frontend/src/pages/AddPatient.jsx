import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../api/api';

const AddPatient = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        prakriti: 'Vata',
        dietaryPreference: 'Veg',
        digestionStrength: 'Medium',
        waterIntake: '',
        bowelMovement: 'Regular',
        // Optional body metrics for BMR calorie calculation
        weight: '',
        height: '',
        activityLevel: 'Sedentary',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await patientAPI.create({
                ...formData,
                age: parseInt(formData.age),
                waterIntake: parseFloat(formData.waterIntake),
                ...(formData.weight && { weight: parseFloat(formData.weight) }),
                ...(formData.height && { height: parseFloat(formData.height) }),
            });

            const patient = response.data.data;
            navigate(`/patients/${patient._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#E2F0F0',
            padding: '40px 24px',
        }}>
            {/* ── Page Container ── */}
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>

                {/* ── Page Header ── */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{
                        fontSize: '28px', fontWeight: 700,
                        color: '#36565F', margin: 0, lineHeight: 1.2
                    }}>
                        Add New Patient
                    </h1>
                    <p style={{
                        fontSize: '15px', color: '#5F8190',
                        margin: '8px 0 0'
                    }}>
                        Enter patient information to create a new clinical record
                    </p>
                </div>

                {/* ── Error Alert ── */}
                {error && (
                    <div style={{
                        background: '#FFF0F0',
                        borderLeft: '4px solid #e53e3e',
                        padding: '12px 16px',
                        borderRadius: '0 8px 8px 0',
                        marginBottom: '20px',
                        color: '#c53030',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* ── Form Card ── */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}>
                    <form onSubmit={handleSubmit} noValidate>

                        {/* ── SECTION: Basic Details ── */}
                        <p style={{
                            fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px',
                            color: '#5F8190', textTransform: 'uppercase', marginBottom: '16px'
                        }}>
                            Basic Details
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '18px 24px',
                            marginBottom: '28px',
                        }}>
                            {/* Full Name — full width */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.label}>Full Name *</label>
                                <input
                                    type="text" name="name" required
                                    value={formData.name} onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Enter patient's full name"
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}
                                />
                            </div>

                            {/* Age */}
                            <div>
                                <label style={styles.label}>Age *</label>
                                <input
                                    type="number" name="age" required min="1" max="120"
                                    value={formData.age} onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Years"
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label style={styles.label}>Gender *</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}
                                    style={styles.select}
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* ── SECTION: Ayurvedic Profile ── */}
                        <p style={{
                            fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px',
                            color: '#5F8190', textTransform: 'uppercase', marginBottom: '16px'
                        }}>
                            Ayurvedic Profile
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '18px 24px',
                            marginBottom: '28px',
                        }}>
                            {/* Prakriti */}
                            <div>
                                <label style={styles.label}>Prakriti (Constitution) *</label>
                                <select name="prakriti" value={formData.prakriti} onChange={handleChange}
                                    style={styles.select}
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}>
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
                                <label style={styles.label}>Dietary Preference *</label>
                                <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange}
                                    style={styles.select}
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}>
                                    <option value="Veg">Vegetarian</option>
                                    <option value="Non-Veg">Non-Vegetarian</option>
                                </select>
                            </div>
                        </div>

                        {/* ── SECTION: Digestive Health ── */}
                        <p style={{
                            fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px',
                            color: '#5F8190', textTransform: 'uppercase', marginBottom: '16px'
                        }}>
                            Digestive Health
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '18px 24px',
                        }}>
                            {/* Digestion Strength */}
                            <div>
                                <label style={styles.label}>Digestion Strength *</label>
                                <select name="digestionStrength" value={formData.digestionStrength} onChange={handleChange}
                                    style={styles.select}
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            {/* Water Intake */}
                            <div>
                                <label style={styles.label}>Water Intake (L/day) *</label>
                                <input
                                    type="number" name="waterIntake" required min="0" step="0.1"
                                    value={formData.waterIntake} onChange={handleChange}
                                    style={styles.input}
                                    placeholder="e.g. 2.5"
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}
                                />
                            </div>

                            {/* Bowel Movement — full width */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.label}>Bowel Movement *</label>
                                <select name="bowelMovement" value={formData.bowelMovement} onChange={handleChange}
                                    style={{ ...styles.select, maxWidth: '300px' }}
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}>
                                    <option value="Regular">Regular</option>
                                    <option value="Irregular">Irregular</option>
                                </select>
                            </div>
                        </div>

                        {/* ── SECTION: Body Metrics (optional) ── */}
                        <p style={{
                            fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px',
                            color: '#5F8190', textTransform: 'uppercase', marginBottom: '8px', marginTop: '28px'
                        }}>
                            Body Metrics <span style={{ fontWeight: 400, textTransform: 'none', color: '#93b4bc' }}>(optional — used for accurate calorie calculation)</span>
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '18px 24px',
                        }}>
                            {/* Weight */}
                            <div>
                                <label style={styles.label}>Weight (kg)</label>
                                <input
                                    type="number" name="weight" min="1" max="500" step="0.1"
                                    value={formData.weight} onChange={handleChange}
                                    style={styles.input}
                                    placeholder="e.g. 70"
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}
                                />
                            </div>

                            {/* Height */}
                            <div>
                                <label style={styles.label}>Height (cm)</label>
                                <input
                                    type="number" name="height" min="30" max="300" step="0.5"
                                    value={formData.height} onChange={handleChange}
                                    style={styles.input}
                                    placeholder="e.g. 170"
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}
                                />
                            </div>

                            {/* Activity Level — full width */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.label}>Activity Level</label>
                                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}
                                    style={{ ...styles.select, maxWidth: '360px' }}
                                    onFocus={e => applyFocus(e)} onBlur={e => removeFocus(e)}>
                                    <option value="Sedentary">Sedentary (little or no exercise)</option>
                                    <option value="LightlyActive">Lightly Active (1–3 days/week)</option>
                                    <option value="ModeratelyActive">Moderately Active (3–5 days/week)</option>
                                    <option value="VeryActive">Very Active (6–7 days/week)</option>
                                    <option value="ExtraActive">Extra Active (athlete / physical job)</option>
                                </select>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            marginTop: '32px',
                            paddingTop: '24px',
                            borderTop: '1px solid #E2F0F0',
                        }}>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    padding: '10px 20px',
                                    background: 'transparent',
                                    border: '1px solid #5F8190',
                                    borderRadius: '8px',
                                    color: '#36565F',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'background 0.18s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#E2F0F0'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '10px 24px',
                                    background: loading ? '#93b4bc' : '#36565F',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.18s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2a4149'; }}
                                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#36565F'; }}
                            >
                                {loading && (
                                    <svg style={{ width: '16px', height: '16px', animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                                        <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {loading ? 'Creating...' : 'Create Patient'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Responsive grid note / media query handled via keyframe injection */}
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @media (max-width: 640px) {
                        .ap-grid { grid-template-columns: 1fr !important; }
                        .ap-full { grid-column: span 1 !important; }
                    }
                `}</style>
            </div>
        </div>
    );
};

// ── Input / Label style constants ──────────────────────────────────────────────
const styles = {
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: 500,
        color: '#5F8190',
        marginBottom: '6px',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #D0E4E8',
        background: '#FFFFFF',
        fontSize: '14px',
        color: '#141414',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #D0E4E8',
        background: '#FFFFFF',
        fontSize: '14px',
        color: '#141414',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        appearance: 'none',
        cursor: 'pointer',
    },
};

// ── Focus helpers ──────────────────────────────────────────────────────────────
const applyFocus = (e) => {
    e.target.style.borderColor = '#5F8190';
    e.target.style.boxShadow = '0 0 0 3px rgba(95,129,144,0.18)';
};
const removeFocus = (e) => {
    e.target.style.borderColor = '#D0E4E8';
    e.target.style.boxShadow = 'none';
};

export default AddPatient;
