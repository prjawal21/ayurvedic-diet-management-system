import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { visitAPI, patientAPI, dietAPI } from '../api/api';

const VisitDetail = () => {
    const { visitId } = useParams();
    const navigate = useNavigate();
    const [visit, setVisit] = useState(null);
    const [patient, setPatient] = useState(null);
    const [dietChart, setDietChart] = useState(null);
    const [dietHistory, setDietHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchVisit();
        fetchDietChart();
        fetchDietHistory();
    }, [visitId]);

    const fetchVisit = async () => {
        try {
            const response = await visitAPI.getById(visitId);
            const visitData = response.data.data;
            setVisit(visitData);

            if (visitData.patient) {
                const patientId = typeof visitData.patient === 'object'
                    ? visitData.patient._id
                    : visitData.patient;
                const patientResponse = await patientAPI.getById(patientId);
                setPatient(patientResponse.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch visit');
        } finally {
            setLoading(false);
        }
    };

    const fetchDietChart = async () => {
        try {
            const response = await dietAPI.getByVisitId(visitId);
            setDietChart(response.data.data);
        } catch (err) {
            // No diet chart yet — this is okay
        }
    };

    const fetchDietHistory = async () => {
        try {
            const response = await dietAPI.getHistory(visitId);
            setDietHistory(response.data.data || []);
        } catch (err) {
            // No history yet — this is okay
        }
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#E2F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#5F8190', fontWeight: 500 }}>Loading visit...</p>
            </div>
        );
    }

    if (error && !visit) {
        return (
            <div style={{ minHeight: '100vh', background: '#E2F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#e53e3e', fontWeight: 500 }}>{error}</p>
            </div>
        );
    }

    const visitDateFormatted = visit?.visitDate
        ? new Date(visit.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    return (
        <div style={{ minHeight: '100vh', background: '#E2F0F0', padding: '40px 24px' }}>
            {/* ── Page Container ── */}
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* ── Page Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#36565F', margin: 0, lineHeight: 1.2 }}>
                            Visit Details
                        </h1>
                        <p style={{ fontSize: '14px', color: '#5F8190', margin: '6px 0 0' }}>
                            {visitDateFormatted}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/patients/${patient?._id}`)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 16px',
                            border: '1px solid #5F8190',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: '#36565F',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background 0.18s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(95,129,144,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Patient
                    </button>
                </div>

                {/* ── Error Banner ── */}
                {error && (
                    <div style={{
                        background: '#FFF0F0', borderLeft: '4px solid #e53e3e',
                        padding: '12px 16px', borderRadius: '0 8px 8px 0',
                        marginBottom: '20px', color: '#c53030',
                        fontSize: '14px', fontWeight: 500,
                    }}>
                        {error}
                    </div>
                )}

                {/* ── Patient Info Card ── */}
                {patient && (
                    <div style={card}>
                        <SectionTitle>Patient Information</SectionTitle>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '20px 40px',
                            marginTop: '18px',
                        }}>
                            <InfoField label="Full Name" value={patient.name} />
                            <InfoField label="Age" value={patient.age ? `${patient.age} years` : '—'} />
                            <InfoField label="Gender" value={patient.gender} />
                            <InfoField label="Prakriti" value={null} badge={patient.prakriti} />
                        </div>
                    </div>
                )}

                {/* ── Visit Information Card ── */}
                <div style={card}>
                    <SectionTitle>Visit Information</SectionTitle>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '20px 40px',
                        marginTop: '18px',
                    }}>
                        <InfoField label="Visit Date" value={visitDateFormatted} />
                        <InfoField label="Chief Complaint" value={visit?.chiefComplaint} />
                        {visit?.notes && (
                            <div style={{ gridColumn: 'span 2' }}>
                                <InfoField label="Notes" value={visit.notes} />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Diet Chart Card ── */}
                <div style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                        <SectionTitle>Diet Chart</SectionTitle>
                        {dietChart && (
                            <span style={{
                                fontSize: '12px', fontWeight: 600,
                                background: 'rgba(54,86,95,0.08)',
                                color: '#36565F',
                                padding: '4px 10px',
                                borderRadius: '20px',
                            }}>
                                Version {dietChart.version}
                                {!dietChart.isActive && <span style={{ color: '#e53e3e', marginLeft: '4px' }}> · Historical</span>}
                            </span>
                        )}
                    </div>

                    {!dietChart ? (
                        /* No diet yet */
                        <div style={{ padding: '32px 0', textAlign: 'center' }}>
                            <div style={{
                                width: '48px', height: '48px', margin: '0 auto 14px',
                                background: 'rgba(95,129,144,0.1)', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#5F8190" style={{ width: '22px', height: '22px' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p style={{ color: '#5F8190', fontSize: '14px', marginBottom: '20px' }}>
                                No diet chart created for this visit yet.
                            </p>
                            <button
                                onClick={() => navigate(`/visits/${visitId}/create-diet`)}
                                style={primaryBtn}
                                onMouseEnter={e => e.currentTarget.style.background = '#2b454d'}
                                onMouseLeave={e => e.currentTarget.style.background = '#36565F'}
                            >
                                Create Diet Plan
                            </button>
                        </div>
                    ) : (
                        /* Diet exists */
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => navigate(`/visits/${visitId}/create-diet`)}
                                style={primaryBtn}
                                onMouseEnter={e => e.currentTarget.style.background = '#2b454d'}
                                onMouseLeave={e => e.currentTarget.style.background = '#36565F'}
                            >
                                Edit Diet Plan
                            </button>
                            <Link
                                to={`/diet/${visitId}?type=visit`}
                                style={{
                                    padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                                    border: '1px solid #5F8190', color: '#36565F', textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', transition: 'background 0.18s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(95,129,144,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                View Diet
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── Diet History Card ── */}
                {dietHistory.length > 0 && (
                    <div style={card}>
                        <SectionTitle>Diet Chart History</SectionTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                            {dietHistory.map((diet) => (
                                <div key={diet._id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px 16px',
                                    background: '#F8FBFB',
                                    borderRadius: '8px',
                                    border: '1px solid #E2F0F0',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#36565F' }}>
                                            Version {diet.version}
                                        </span>
                                        <span style={{ fontSize: '13px', color: '#5F8190' }}>
                                            {new Date(diet.createdAt).toLocaleDateString()}
                                        </span>
                                        {diet.isActive && (
                                            <span style={{
                                                fontSize: '11px', fontWeight: 600,
                                                background: 'rgba(54,86,95,0.12)', color: '#36565F',
                                                padding: '3px 8px', borderRadius: '20px',
                                            }}>
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        to={`/diet/${visitId}?type=visit&version=${diet.version}`}
                                        style={{ fontSize: '13px', color: '#5F8190', fontWeight: 500, textDecoration: 'none' }}
                                    >
                                        View →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Responsive */}
                <style>{`
                    @media (max-width: 640px) {
                        .vd-info-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>
            </div>
        </div>
    );
};

/* ── Shared style objects ──────────────────────────────────────── */
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
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
};

/* ── Helper components ─────────────────────────────────────────── */
const SectionTitle = ({ children }) => (
    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#36565F', margin: 0, letterSpacing: '-0.1px' }}>
        {children}
    </h3>
);

const InfoField = ({ label, value, badge }) => (
    <div>
        <p style={{ fontSize: '12px', color: '#5F8190', fontWeight: 500, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {label}
        </p>
        {badge ? (
            <span style={{
                display: 'inline-block',
                background: 'rgba(95,129,144,0.15)',
                color: '#36565F',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 500,
            }}>
                {badge}
            </span>
        ) : (
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#141414', margin: 0 }}>
                {value || '—'}
            </p>
        )}
    </div>
);

export default VisitDetail;
