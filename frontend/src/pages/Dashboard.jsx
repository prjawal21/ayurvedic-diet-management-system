import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientAPI } from '../api/api';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredId, setHoveredId] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await patientAPI.getAll();
            setPatients(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient?.prakriti?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E2F0F0 0%, #ffffff 60%, rgba(95,129,144,0.08) 100%)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 16px' }}>
                        <div style={{ position: 'absolute', inset: 0, border: '4px solid #E2F0F0', borderRadius: '50%' }}></div>
                        <div className="animate-spin" style={{ position: 'absolute', inset: 0, border: '4px solid #36565F', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    </div>
                    <p style={{ color: '#5F8190', fontWeight: 500 }}>Loading patients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E2F0F0 0%, #ffffff 60%, rgba(95,129,144,0.08) 100%)' }}>
            <main className="page-container">

                {/* ── Page Header ── */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Patient Management</h1>
                        <p className="section-subtitle" style={{ marginTop: '6px' }}>
                            Manage and view all your patients
                        </p>
                    </div>
                    <Link to="/patients/new" className="primary-btn" style={{ textDecoration: 'none', gap: '8px' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Patient
                    </Link>
                </div>

                {/* ── Search Bar ── */}
                <div className="search-wrapper" style={{ marginBottom: '28px' }}>
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search patients by name or prakriti..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ paddingLeft: '42px' }}
                    />
                </div>

                {/* ── Error Alert ── */}
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

                {/* ── Patient List ── */}
                {filteredPatients.length === 0 ? (
                    <div className="card-base" style={{ padding: '64px 48px', textAlign: 'center' }}>
                        <div style={{ width: '72px', height: '72px', margin: '0 auto 20px', background: 'rgba(95,129,144,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#5F8190" style={{ width: '36px', height: '36px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="section-title" style={{ marginBottom: '8px' }}>No Patients Found</h3>
                        <p className="section-subtitle" style={{ marginBottom: '24px' }}>
                            {searchTerm ? 'Try adjusting your search criteria' : 'Add your first patient to get started'}
                        </p>
                        {!searchTerm && (
                            <Link to="/patients/new" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                                Add Your First Patient
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {filteredPatients.map((patient) =>
                            patient && patient._id ? (
                                <div
                                    key={patient._id}
                                    onClick={() => navigate(`/patients/${patient._id}`)}
                                    onMouseEnter={() => setHoveredId(patient._id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '14px',
                                        padding: '22px 26px',
                                        boxShadow: hoveredId === patient._id
                                            ? '0 8px 22px rgba(0,0,0,0.10)'
                                            : '0 4px 14px rgba(0,0,0,0.06)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        cursor: 'pointer',
                                        transform: hoveredId === patient._id ? 'translateY(-2px)' : 'translateY(0)',
                                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                        borderLeft: hoveredId === patient._id
                                            ? '3px solid #36565F'
                                            : '3px solid transparent',
                                    }}
                                >
                                    {/* ── LEFT: Name + Meta + Summary Grid ── */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{
                                            fontSize: '18px', fontWeight: 600,
                                            color: '#141414', margin: '0 0 4px',
                                            lineHeight: 1.3,
                                        }}>
                                            {patient.name || 'N/A'}
                                        </h3>
                                        <p style={{
                                            fontSize: '13px', color: '#5F8190',
                                            margin: '0 0 16px',
                                        }}>
                                            {patient.age ? `${patient.age} yrs` : 'Age N/A'}
                                            &nbsp;·&nbsp;
                                            {patient.gender || 'N/A'}
                                        </p>

                                        {/* 3-column summary grid */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: '10px 24px',
                                        }}>
                                            <SummaryItem label="Diet" value={patient.dietaryPreference} />
                                            <SummaryItem label="Digestion" value={patient.digestionStrength} />
                                            <SummaryItem
                                                label="Water Intake"
                                                value={patient.waterIntake ? `${patient.waterIntake} L` : null}
                                            />
                                        </div>
                                    </div>

                                    {/* ── RIGHT: Prakriti Badge + Arrow ── */}
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'flex-end', gap: '16px',
                                        marginLeft: '24px', flexShrink: 0,
                                    }}>
                                        <span style={{
                                            background: 'rgba(95,129,144,0.15)',
                                            color: '#36565F',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            letterSpacing: '0.2px',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {patient.prakriti || 'N/A'}
                                        </span>
                                        <svg
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            style={{
                                                width: '18px', height: '18px',
                                                color: hoveredId === patient._id ? '#36565F' : '#C5D9DC',
                                                transition: 'color 0.15s ease',
                                            }}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            ) : null
                        )}
                    </div>
                )}

                {/* ── Stats Footer ── */}
                {filteredPatients.length > 0 && (
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <p className="meta-text">
                            Showing <strong style={{ color: '#36565F' }}>{filteredPatients.length}</strong> of{' '}
                            <strong style={{ color: '#36565F' }}>{patients.length}</strong> patients
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

/* ── Helper component ── */
const SummaryItem = ({ label, value }) => (
    <div>
        <span style={{
            display: 'block', fontSize: '11px', fontWeight: 600,
            color: '#5F8190', textTransform: 'uppercase',
            letterSpacing: '0.4px', marginBottom: '3px',
        }}>
            {label}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#36565F' }}>
            {value || '—'}
        </span>
    </div>
);

export default Dashboard;

