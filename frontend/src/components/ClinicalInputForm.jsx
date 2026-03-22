import React, { useState } from 'react';
import { dietAPI } from '../api/api';

const ClinicalInputForm = ({ visit, patient, onSubmit, onBack }) => {
    const [formData, setFormData] = useState({
        prakriti: patient?.prakriti || '',
        agni: patient?.digestionStrength || 'Medium',
        doshaSeverity: 'Moderate',
        season: patient?.currentSeason || '',
        dietPreference: patient?.dietaryPreference || 'Veg',
        doctorNotes: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.prakriti) newErrors.prakriti = 'Required';
        if (!formData.agni) newErrors.agni = 'Required';
        if (!formData.doshaSeverity) newErrors.doshaSeverity = 'Required';
        if (!formData.dietPreference) newErrors.dietPreference = 'Required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await dietAPI.generateDiet({
                visitId: visit._id,
                ...formData
            });
            onSubmit(response.data);
        } catch (error) {
            console.error('Error generating diet:', error);
            alert('Failed to generate diet: ' + (error.response?.data?.message || error.message));
            setLoading(false);
        }
    };

    const visitDate = visit?.visitDate
        ? new Date(visit.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    return (
        <div>
            {/* ── Page Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#36565F', margin: 0, lineHeight: 1.2 }}>
                        Create Diet Plan
                    </h1>
                    <p style={{ fontSize: '14px', color: '#5F8190', margin: '6px 0 0' }}>
                        Clinical Input & Customization
                    </p>
                </div>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '9px 16px', border: '1px solid #5F8190',
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
            </div>

            {/* ── Card 1: Visit Context ── */}
            <div style={{ ...cardStyle, display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div>
                    <p style={metaLabel}>Patient</p>
                    <p style={metaValue}>{patient?.name || '—'}</p>
                </div>
                <div>
                    <p style={metaLabel}>Visit Date</p>
                    <p style={metaValue}>{visitDate}</p>
                </div>
                <div>
                    <p style={metaLabel}>Prakriti</p>
                    <span style={{
                        display: 'inline-block',
                        background: 'rgba(95,129,144,0.15)',
                        color: '#36565F',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 500,
                        marginTop: '2px',
                    }}>
                        {patient?.prakriti || '—'}
                    </span>
                </div>
                {patient?.dietaryPreference && (
                    <div>
                        <p style={metaLabel}>Diet Preference</p>
                        <p style={metaValue}>{patient.dietaryPreference}</p>
                    </div>
                )}
            </div>

            {/* ── Card 2: Clinical Inputs ── */}
            <div style={cardStyle}>
                <p style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px',
                    color: '#5F8190', textTransform: 'uppercase', marginBottom: '22px', marginTop: 0,
                }}>
                    Step 1 — Clinical Assessment
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '20px 32px',
                    }}>
                        {/* Prakriti — full width */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Prakriti (Constitution) *</label>
                            <select
                                value={formData.prakriti}
                                onChange={(e) => setFormData({ ...formData, prakriti: e.target.value })}
                                style={selectStyle}
                                onFocus={applyFocus} onBlur={removeFocus}
                            >
                                <option value="">Select Prakriti</option>
                                <option value="Vata">Vata</option>
                                <option value="Pitta">Pitta</option>
                                <option value="Kapha">Kapha</option>
                                <option value="Vata-Pitta">Vata-Pitta</option>
                                <option value="Pitta-Kapha">Pitta-Kapha</option>
                                <option value="Vata-Kapha">Vata-Kapha</option>
                            </select>
                            {errors.prakriti && <p style={errorMsg}>{errors.prakriti}</p>}
                        </div>

                        {/* Agni */}
                        <div>
                            <label style={labelStyle}>Agni (Digestive Strength) *</label>
                            <div style={radioGroup}>
                                {['Low', 'Medium', 'High'].map((level) => (
                                    <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', color: '#141414', cursor: 'pointer' }}>
                                        <input
                                            type="radio" value={level}
                                            checked={formData.agni === level}
                                            onChange={(e) => setFormData({ ...formData, agni: e.target.value })}
                                            style={{ accentColor: '#36565F' }}
                                        />
                                        {level}
                                    </label>
                                ))}
                            </div>
                            {errors.agni && <p style={errorMsg}>{errors.agni}</p>}
                        </div>

                        {/* Dosha Severity */}
                        <div>
                            <label style={labelStyle}>Dosha Imbalance Severity *</label>
                            <div style={radioGroup}>
                                {['Mild', 'Moderate', 'Severe'].map((level) => (
                                    <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', color: '#141414', cursor: 'pointer' }}>
                                        <input
                                            type="radio" value={level}
                                            checked={formData.doshaSeverity === level}
                                            onChange={(e) => setFormData({ ...formData, doshaSeverity: e.target.value })}
                                            style={{ accentColor: '#36565F' }}
                                        />
                                        {level}
                                    </label>
                                ))}
                            </div>
                            {errors.doshaSeverity && <p style={errorMsg}>{errors.doshaSeverity}</p>}
                        </div>

                        {/* Season */}
                        <div>
                            <label style={labelStyle}>Season (Ritu)</label>
                            <select
                                value={formData.season}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                style={selectStyle}
                                onFocus={applyFocus} onBlur={removeFocus}
                            >
                                <option value="">Select Season (Optional)</option>
                                <option value="Vasanta">Vasanta (Spring)</option>
                                <option value="Grishma">Grishma (Summer)</option>
                                <option value="Varsha">Varsha (Monsoon)</option>
                                <option value="Sharad">Sharad (Autumn)</option>
                                <option value="Hemanta">Hemanta (Early Winter)</option>
                                <option value="Shishira">Shishira (Late Winter)</option>
                            </select>
                        </div>

                        {/* Diet Preference */}
                        <div>
                            <label style={labelStyle}>Diet Preference *</label>
                            <div style={radioGroup}>
                                {['Veg', 'Non-Veg'].map((pref) => (
                                    <label key={pref} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', color: '#141414', cursor: 'pointer' }}>
                                        <input
                                            type="radio" value={pref}
                                            checked={formData.dietPreference === pref}
                                            onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value })}
                                            style={{ accentColor: '#36565F' }}
                                        />
                                        {pref === 'Veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                                    </label>
                                ))}
                            </div>
                            {errors.dietPreference && <p style={errorMsg}>{errors.dietPreference}</p>}
                        </div>

                        {/* Doctor Notes — full width */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Doctor Notes</label>
                            <textarea
                                value={formData.doctorNotes}
                                onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                                rows={3}
                                placeholder="Optional clinical observations, allergies, or special instructions..."
                                style={{
                                    ...selectStyle,
                                    resize: 'vertical',
                                    lineHeight: 1.6,
                                    fontFamily: 'inherit',
                                }}
                                onFocus={applyFocus} onBlur={removeFocus}
                            />
                        </div>
                    </div>

                    {/* ── Action ── */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E2F0F0' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 28px',
                                background: loading ? '#93b4bc' : '#36565F',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2b454d'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#36565F'; }}
                        >
                            {loading && (
                                <svg style={{ width: '16px', height: '16px', animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                                    <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {loading ? 'Generating...' : 'Create Diet Plan'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

/* ── Style constants ─────────────────────────────────────────── */
const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px 28px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    marginBottom: '20px',
};

const metaLabel = {
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
    color: '#5F8190', textTransform: 'uppercase', margin: '0 0 4px',
};

const metaValue = {
    fontSize: '15px', fontWeight: 500, color: '#141414', margin: 0,
};

const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 500,
    color: '#5F8190', marginBottom: '8px',
};

const selectStyle = {
    width: '100%', padding: '10px 12px',
    borderRadius: '8px', border: '1px solid #D0E4E8',
    background: '#FFFFFF', fontSize: '14px', color: '#141414',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

const radioGroup = {
    display: 'flex', gap: '18px',
    padding: '10px 14px',
    background: '#F5FAFA',
    borderRadius: '8px',
    flexWrap: 'wrap',
};

const errorMsg = {
    color: '#e53e3e', fontSize: '12px', margin: '4px 0 0', fontWeight: 500,
};

const applyFocus = (e) => {
    e.target.style.borderColor = '#5F8190';
    e.target.style.boxShadow = '0 0 0 3px rgba(95,129,144,0.18)';
};
const removeFocus = (e) => {
    e.target.style.borderColor = '#D0E4E8';
    e.target.style.boxShadow = 'none';
};

export default ClinicalInputForm;
