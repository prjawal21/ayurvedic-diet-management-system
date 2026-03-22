import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { patientAPI, visitAPI } from '../api/api';
import CreateVisitModal from '../components/CreateVisitModal';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [visits, setVisits] = useState([]);
    const [showCreateVisit, setShowCreateVisit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPatient();
        fetchVisits();
    }, [id]);

    const fetchPatient = async () => {
        try {
            const response = await patientAPI.getById(id);
            setPatient(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch patient');
        } finally {
            setLoading(false);
        }
    };

    const fetchVisits = async () => {
        try {
            const response = await visitAPI.getPatientVisits(id);
            setVisits(response.data.data || []);
        } catch (err) {
            // Failed to fetch visits - not critical
        }
    };

    const handleVisitCreated = (newVisit) => {
        setShowCreateVisit(false);
        navigate(`/visits/${newVisit._id}`);
    };

    const handleDeletePatient = async () => {
        if (!window.confirm(`Delete ${patient?.name}? This cannot be undone.`)) return;
        try {
            await patientAPI.delete(id);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete patient');
        }
    };

    /* ── Loading state ── */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#E2F0F0' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 16px' }}>
                        <div style={{ position: 'absolute', inset: 0, border: '4px solid #ffffff', borderRadius: '50%' }}></div>
                        <div className="animate-spin" style={{ position: 'absolute', inset: 0, border: '4px solid #36565F', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    </div>
                    <p style={{ color: '#5F8190', fontWeight: 500 }}>Loading patient...</p>
                </div>
            </div>
        );
    }

    /* ── Fatal error state ── */
    if (error && !patient) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#E2F0F0' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '72px', height: '72px', margin: '0 auto 16px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" style={{ width: '32px', height: '32px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <p style={{ color: '#dc2626', fontWeight: 500 }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: '#E2F0F0' }}>
            <div className="pd-container">

                {/* ══ PAGE HEADER ══ */}
                <div className="pd-page-header">
                    <div>
                        <h1 className="pd-page-title">Patient Details</h1>
                        <p className="pd-page-subtitle">{patient.name}</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="pd-back-btn"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '15px', height: '15px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                {/* ══ ERROR ALERT ══ */}
                {error && (
                    <div className="animate-slide-down" style={{
                        marginBottom: '24px',
                        background: '#FFF0F0',
                        borderLeft: '4px solid #e53e3e',
                        padding: '14px 18px',
                        borderRadius: '0 8px 8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <svg viewBox="0 0 20 20" fill="currentColor" style={{ color: '#e53e3e', width: '18px', height: '18px', flexShrink: 0 }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span style={{ color: '#c53030', fontWeight: 500 }}>{error}</span>
                    </div>
                )}

                {/* ══ PROFILE SUMMARY CARD ══ */}
                <div className="pd-summary-card card-base" style={{ marginBottom: '28px' }}>
                    {/* Left: Identity */}
                    <div className="pd-summary-identity">
                        <div className="pd-avatar">
                            {patient.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="pd-patient-name">{patient.name}</h2>
                            <p className="pd-patient-meta">
                                {patient.age} years &nbsp;·&nbsp; {patient.gender}
                            </p>
                        </div>
                    </div>

                    {/* Right: Badges + Edit */}
                    <div className="pd-summary-right">
                        <div className="pd-badges-row">
                            {patient.prakriti && (
                                <span className="prakriti-badge">{patient.prakriti}</span>
                            )}
                            {patient.dietaryPreference && (
                                <span className="pd-diet-badge">{patient.dietaryPreference}</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Link
                                to={`/patients/${id}/edit`}
                                className="primary-btn"
                                style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}
                            >
                                Edit Patient
                            </Link>
                            <button
                                onClick={handleDeletePatient}
                                style={{
                                    padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                                    border: '1.5px solid #e53e3e', borderRadius: '8px',
                                    background: 'transparent', color: '#e53e3e',
                                    cursor: 'pointer', transition: 'all 0.18s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#e53e3e'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e53e3e'; }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══ INFORMATION SECTIONS ══ */}
                <div className="pd-sections-grid">

                    {/* Card 1: Personal Information */}
                    <div className="card-base pd-info-card">
                        <div className="pd-card-header">
                            <h3 className="pd-section-title">Personal Information</h3>
                        </div>
                        <div className="pd-card-divider"></div>
                        <div className="details-grid" style={{ padding: '20px 24px 24px' }}>
                            <div className="detail-item">
                                <span className="detail-label">Full Name</span>
                                <span className="detail-value">{patient.name || '—'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Age</span>
                                <span className="detail-value">{patient.age ? `${patient.age} years` : '—'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Gender</span>
                                <span className="detail-value">{patient.gender || '—'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Prakriti</span>
                                <span className="detail-value">
                                    {patient.prakriti
                                        ? <span className="prakriti-badge" style={{ verticalAlign: 'middle' }}>{patient.prakriti}</span>
                                        : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Dietary Profile */}
                    <div className="card-base pd-info-card">
                        <div className="pd-card-header">
                            <h3 className="pd-section-title">Dietary Profile</h3>
                        </div>
                        <div className="pd-card-divider"></div>
                        <div className="details-grid" style={{ padding: '20px 24px 24px' }}>
                            <div className="detail-item">
                                <span className="detail-label">Dietary Preference</span>
                                <span className="detail-value">{patient.dietaryPreference || '—'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Digestion Strength</span>
                                <span className="detail-value">{patient.digestionStrength || '—'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Water Intake</span>
                                <span className="detail-value">{patient.waterIntake ? `${patient.waterIntake} L/day` : '—'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Bowel Movement</span>
                                <span className="detail-value">{patient.bowelMovement || '—'}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ══ VISIT HISTORY CARD ══ */}
                <div className="card-base pd-info-card" style={{ marginTop: '28px' }}>
                    <div className="pd-card-header" style={{ justifyContent: 'space-between' }}>
                        <h3 className="pd-section-title">Visit History</h3>
                        <button
                            onClick={() => setShowCreateVisit(true)}
                            className="primary-btn"
                            style={{ fontSize: '13px', padding: '8px 16px' }}
                        >
                            + Create Visit
                        </button>
                    </div>
                    <div className="pd-card-divider"></div>
                    <div style={{ padding: '16px 24px 24px' }}>
                        {visits.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ width: '56px', height: '56px', margin: '0 auto 14px', background: 'rgba(95,129,144,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#5F8190" style={{ width: '26px', height: '26px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="meta-text">No visits recorded yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {visits.map((visit) => (
                                    <div key={visit._id} className="pd-visit-row">
                                        <div style={{ flex: 1 }}>
                                            <div className="pd-visit-date">
                                                {new Date(visit.visitDate).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </div>
                                            <div className="pd-visit-complaint">{visit.chiefComplaint}</div>
                                            {visit.notes && (
                                                <div className="pd-visit-notes">{visit.notes}</div>
                                            )}
                                        </div>
                                        <Link
                                            to={`/visits/${visit._id}`}
                                            className="action-btn"
                                            style={{ textDecoration: 'none', alignSelf: 'flex-start', marginLeft: '16px', whiteSpace: 'nowrap' }}
                                        >
                                            Open Visit
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ══ DIET CHART INFO CARD ══ */}
                <div className="card-base" style={{ marginTop: '28px', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{
                            width: '40px', height: '40px', flexShrink: 0,
                            background: 'rgba(95,129,144,0.12)', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#5F8190" style={{ width: '20px', height: '20px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, color: '#36565F', fontSize: '14px', marginBottom: '4px' }}>
                                Diet Chart
                            </p>
                            <p style={{ fontSize: '13px', color: '#5F8190', lineHeight: 1.6 }}>
                                Create a visit above to access the diet plan editor for this patient.
                                Each visit has its own editable diet chart with full save and print support.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Create Visit Modal */}
                {showCreateVisit && (
                    <CreateVisitModal
                        patientId={id}
                        onClose={() => setShowCreateVisit(false)}
                        onSuccess={handleVisitCreated}
                    />
                )}
            </div>
        </div>
    );
};

export default PatientDetail;
