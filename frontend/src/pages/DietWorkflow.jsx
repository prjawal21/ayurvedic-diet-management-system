import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI, visitAPI } from '../api/api';
import ClinicalInputForm from '../components/ClinicalInputForm';
import DietResultView from '../components/DietResultView';

const DietWorkflow = () => {
    const { visitId: urlVisitId } = useParams();
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [visits, setVisits] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [currentScreen, setCurrentScreen] = useState(urlVisitId ? 'clinical-input' : 'patient-select');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedDiet, setGeneratedDiet] = useState(null);

    useEffect(() => {
        if (urlVisitId) {
            loadVisitData(urlVisitId);
        } else {
            loadPatients();
        }
    }, [urlVisitId]);

    const loadVisitData = async (visitId) => {
        try {
            setLoading(true);
            const visitResponse = await visitAPI.getById(visitId);
            const visitData = visitResponse.data.data;
            setSelectedVisit(visitData);
            const patientId = typeof visitData.patient === 'object'
                ? visitData.patient._id
                : visitData.patient;
            const patientResponse = await patientAPI.getById(patientId);
            setSelectedPatient(patientResponse.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to load visit data');
            setTimeout(() => navigate('/dashboard'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const loadPatients = async () => {
        try {
            setLoading(true);
            const response = await patientAPI.getAll(searchTerm);
            setPatients(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadPatients();
    };

    const handlePatientSelect = async (patient) => {
        setSelectedPatient(patient);
        setLoading(true);
        try {
            const response = await visitAPI.getByPatient(patient._id);
            setVisits(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to load visits');
        } finally {
            setLoading(false);
        }
    };

    const handleVisitSelect = (visit) => {
        setSelectedVisit(visit);
        setCurrentScreen('clinical-input');
    };

    const handleBackToPatients = () => {
        setSelectedPatient(null);
        setSelectedVisit(null);
        setVisits([]);
        setGeneratedDiet(null);
        setCurrentScreen('patient-select');
    };

    const handleClinicalSubmit = (dietData) => {
        setGeneratedDiet(dietData);
        setCurrentScreen('diet-result');
    };

    const handleBackFromResult = () => {
        setCurrentScreen('clinical-input');
    };

    const handleDietSaved = () => {
        // Navigate to visit detail page — correct post-save destination
        const visitId = urlVisitId || selectedVisit?._id;
        if (visitId) {
            navigate(`/visits/${visitId}`);
        } else {
            handleBackToPatients();
        }
    };

    /* ── Loading / Error full-screen states ── */
    if (loading && currentScreen === 'clinical-input' && !selectedPatient) {
        return (
            <div style={{ minHeight: '100vh', background: '#E2F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#5F8190', fontWeight: 500 }}>Loading visit data...</p>
            </div>
        );
    }

    if (error && !selectedPatient) {
        return (
            <div style={{ minHeight: '100vh', background: '#E2F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#e53e3e', fontWeight: 500 }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#E2F0F0', padding: '40px 24px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* ── Screen: Clinical Input Form ── */}
                {currentScreen === 'clinical-input' && (
                    <ClinicalInputForm
                        visit={selectedVisit}
                        patient={selectedPatient}
                        onSubmit={handleClinicalSubmit}
                        onBack={urlVisitId
                            ? () => navigate(`/visits/${urlVisitId}`)
                            : handleBackToPatients
                        }
                    />
                )}

                {/* ── Screen: Diet Result View ── */}
                {currentScreen === 'diet-result' && (
                    <DietResultView
                        visit={selectedVisit}
                        patient={selectedPatient}
                        dietPlan={generatedDiet}
                        onBack={handleBackFromResult}
                        onSaved={handleDietSaved}
                    />
                )}

                {/* ── Screen: Patient & Visit Selection ── */}
                {currentScreen === 'patient-select' && (
                    <>
                        {/* Page Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#36565F', margin: 0, lineHeight: 1.2 }}>
                                    Create Diet Plan
                                </h1>
                                <p style={{ fontSize: '14px', color: '#5F8190', margin: '6px 0 0' }}>
                                    Select a patient and visit to begin clinical assessment
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
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

                        {/* Error */}
                        {error && (
                            <div style={errorBanner}>{error}</div>
                        )}

                        {/* Step label */}
                        <p style={stepLabel}>Step 1 — Select Patient</p>

                        {/* Patient Search Card */}
                        <div style={card}>
                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="Search by patient name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        flex: 1, padding: '10px 14px',
                                        border: '1px solid #D0E4E8', borderRadius: '8px',
                                        fontSize: '14px', color: '#141414', outline: 'none',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#5F8190'; e.target.style.boxShadow = '0 0 0 3px rgba(95,129,144,0.18)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#D0E4E8'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button type="submit" style={primaryBtn}
                                    onMouseEnter={e => e.currentTarget.style.background = '#2b454d'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#36565F'}>
                                    Search
                                </button>
                            </form>

                            {loading && <p style={{ color: '#5F8190', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>Loading patients...</p>}

                            {!loading && patients.length === 0 && (
                                <p style={{ color: '#5F8190', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                                    No patients found. Try a different search.
                                </p>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {patients.map((patient) => {
                                    const isSelected = selectedPatient?._id === patient._id;
                                    return (
                                        <div
                                            key={patient._id}
                                            onClick={() => handlePatientSelect(patient)}
                                            style={{
                                                padding: '14px 16px',
                                                borderRadius: '8px',
                                                border: `1px solid ${isSelected ? '#36565F' : '#E2F0F0'}`,
                                                background: isSelected ? 'rgba(54,86,95,0.06)' : '#FAFCFC',
                                                cursor: 'pointer',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <div>
                                                <p style={{ fontWeight: 600, color: '#141414', margin: 0, fontSize: '14px' }}>
                                                    {patient.name}
                                                </p>
                                                <p style={{ fontSize: '12px', color: '#5F8190', margin: '2px 0 0' }}>
                                                    {patient.prakriti} · {patient.age}y · {patient.gender}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <span style={{
                                                    fontSize: '12px', fontWeight: 600, color: '#36565F',
                                                    background: 'rgba(54,86,95,0.1)', padding: '3px 10px', borderRadius: '20px',
                                                }}>Selected</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Visit History Card */}
                        {selectedPatient && (
                            <>
                                <p style={stepLabel}>Step 2 — Select Visit</p>
                                <div style={card}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: '#36565F', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                            fontSize: '14px', fontWeight: 700, color: '#fff',
                                        }}>
                                            {selectedPatient.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <p style={{ fontWeight: 600, color: '#36565F', fontSize: '15px', margin: 0 }}>
                                            {selectedPatient.name}
                                        </p>
                                    </div>

                                    {visits.length === 0 ? (
                                        <p style={{ color: '#5F8190', fontSize: '14px', padding: '20px 0', textAlign: 'center' }}>
                                            No visits found for this patient.
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {visits.map((visit) => (
                                                <div
                                                    key={visit._id}
                                                    style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '14px 16px',
                                                        border: '1px solid #E2F0F0',
                                                        borderRadius: '8px',
                                                        background: '#FAFCFC',
                                                    }}
                                                >
                                                    <div>
                                                        <p style={{ fontWeight: 600, color: '#141414', margin: 0, fontSize: '14px' }}>
                                                            {new Date(visit.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </p>
                                                        <p style={{ fontSize: '12px', color: '#5F8190', margin: '2px 0 0' }}>
                                                            {visit.chiefComplaint || 'No complaint recorded'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleVisitSelect(visit)}
                                                        style={primaryBtn}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#2b454d'}
                                                        onMouseLeave={e => e.currentTarget.style.background = '#36565F'}
                                                    >
                                                        Start →
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ── Shared style objects ── */
const card = {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    marginBottom: '20px',
};

const primaryBtn = {
    padding: '10px 18px',
    background: '#36565F',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    whiteSpace: 'nowrap',
};

const stepLabel = {
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px',
    color: '#5F8190', textTransform: 'uppercase',
    marginBottom: '10px', marginTop: '4px',
};

const errorBanner = {
    background: '#FFF0F0', borderLeft: '4px solid #e53e3e',
    padding: '12px 16px', borderRadius: '0 8px 8px 0',
    marginBottom: '20px', color: '#c53030',
    fontSize: '14px', fontWeight: 500,
};

export default DietWorkflow;
