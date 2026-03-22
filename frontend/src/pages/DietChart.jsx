import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { dietAPI } from '../api/api';

const MEAL_META = {
    breakfast: { label: 'Breakfast', icon: '🌅', isSnack: false },
    midMorningSnack: { label: 'Mid-Morning Snack', icon: '🍎', isSnack: true },
    lunch: { label: 'Lunch', icon: '☀️', isSnack: false },
    eveningSnack: { label: 'Evening Snack', icon: '🍚', isSnack: true },
    dinner: { label: 'Dinner', icon: '🌙', isSnack: false },
};

// Local mirror of ICMR 2020 RDA table (backend authoritative copy is in utils/rdaTargets.js)
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

const DietChart = () => {
    const { id } = useParams();
    const dietTargetId = id;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'patient';
    const version = searchParams.get('version');

    const [dietChart, setDietChart] = useState(null);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDietChart();
        if (type === 'visit') fetchVersions();
    }, [dietTargetId, type, version]);

    const fetchDietChart = async () => {
        try {
            let response;
            if (type === 'visit') {
                if (version) {
                    const history = await dietAPI.getHistory(dietTargetId);
                    console.log('[DietChart] History API response:', history.data);
                    const specificVersion = history.data.data.find(d => d.version == version);
                    console.log('[DietChart] Selected version:', specificVersion);
                    setDietChart(specificVersion);
                    return;
                } else {
                    response = await dietAPI.getByVisitId(dietTargetId);
                }
            } else {
                response = await dietAPI.getByPatientId(dietTargetId);
            }
            console.log('[DietChart] API response:', response.data);
            console.log('[DietChart] Patient data:', response.data?.data?.patient);
            setDietChart(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch diet chart');
        } finally {
            setLoading(false);
        }
    };

    const fetchVersions = async () => {
        try {
            const response = await dietAPI.getHistory(dietTargetId);
            setVersions(response.data.data || []);
        } catch { /* non-critical */ }
    };

    const handlePrint = () => window.print();

    const backTarget = type === 'visit' ? `/visits/${dietTargetId}` : `/patients/${dietTargetId}`;

    /* ── Loading ── */
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#E2F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#5F8190', fontWeight: 500 }}>Loading diet chart...</p>
            </div>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: '#E2F0F0', padding: '40px 24px' }}>
                <div style={{ maxWidth: '560px', margin: '80px auto', ...cardStyle }}>
                    <p style={{ color: '#c53030', fontWeight: 500, marginBottom: '16px' }}>
                        {error.includes('not found') || error.includes('No diet chart')
                            ? 'No diet chart found for this visit.'
                            : error}
                    </p>
                    <button onClick={() => navigate(backTarget)} style={outlineBtn}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(95,129,144,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        ← Back to {type === 'visit' ? 'Visit' : 'Patient'}
                    </button>
                </div>
            </div>
        );
    }

    /* ── Main View ── */
    return (
        <div style={{ minHeight: '100vh', background: '#E2F0F0', padding: '40px 24px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* ── Page Header (screen only) ── */}
                <div className="print:hidden" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#36565F', margin: 0 }}>
                            Diet Chart
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            {dietChart?.version && (
                                <span style={pill}>Version {dietChart.version}</span>
                            )}
                            {dietChart && !dietChart.isActive && (
                                <span style={{ ...pill, background: 'rgba(229,62,62,0.1)', color: '#c53030' }}>
                                    Historical
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }} className="no-print">
                        <button onClick={() => navigate(backTarget)} style={outlineBtn}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(95,129,144,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            ← Back to {type === 'visit' ? 'Visit' : 'Patient'}
                        </button>
                        {dietChart?._id && (
                            <button
                                onClick={() => navigate(`/diet/edit/${dietChart._id}`)}
                                style={outlineBtn}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(95,129,144,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                ✏️ Edit Diet
                            </button>
                        )}
                        <button onClick={handlePrint} style={primaryBtn}
                            onMouseEnter={e => e.currentTarget.style.background = '#2b454d'}
                            onMouseLeave={e => e.currentTarget.style.background = '#36565F'}>
                            🖨 Print / Export PDF
                        </button>
                    </div>
                </div>

                {/* ── Print-only header (hidden on screen) ── */}
                <div className="print-only" style={{ display: 'none', marginBottom: '20px', padding: '16px 0', borderBottom: '2px solid #36565F' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#36565F', margin: '0 0 4px' }}>VedaCare — Ayurvedic Diet Chart</h2>
                    <p style={{ fontSize: '12px', color: '#5F8190', margin: 0 }}>
                        Patient: <strong>{dietChart?.patient?.name}</strong>
                        {' '}· Age: {dietChart?.patient?.age}y
                        {' '}· Gender: {dietChart?.patient?.gender}
                        {' '}· Prakriti: {dietChart?.patient?.prakriti}
                        {' '}· Generated: {dietChart?.createdAt ? new Date(dietChart.createdAt).toLocaleDateString('en-IN') : ''}
                    </p>
                </div>

                {/* Version Selector */}
                {type === 'visit' && versions.length > 1 && (
                    <div className="print:hidden" style={{ marginBottom: '20px' }}>
                        <select
                            value={version || ''}
                            onChange={(e) => {
                                const v = e.target.value;
                                navigate(v
                                    ? `/diet/${dietTargetId}?type=visit&version=${v}`
                                    : `/diet/${dietTargetId}?type=visit`
                                );
                            }}
                            style={{
                                padding: '9px 12px', borderRadius: '8px',
                                border: '1px solid #D0E4E8', background: '#fff',
                                fontSize: '13px', color: '#36565F', outline: 'none',
                            }}
                        >
                            <option value="">Latest (Version {versions[0]?.version})</option>
                            {versions.map(v => (
                                <option key={v._id} value={v.version}>
                                    Version {v.version} — {new Date(v.createdAt).toLocaleDateString()}
                                    {v.isActive ? ' (Active)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* ── Patient Info Card ── */}
                <div style={cardStyle}>
                    <SectionTitle>Patient</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 40px', marginTop: '16px' }}>
                        <InfoField label="Name" value={dietChart.patient?.name} />
                        <InfoField label="Age" value={dietChart.patient?.age ? `${dietChart.patient.age} years` : '—'} />
                        <InfoField label="Gender" value={dietChart.patient?.gender} />
                        <InfoField label="Prakriti" badge={dietChart.patient?.prakriti} />
                        <InfoField label="Diet Type" value={dietChart.patient?.dietaryPreference} />
                        <InfoField label="Digestion" value={dietChart.patient?.digestionStrength} />
                        <InfoField label="Generated" value={new Date(dietChart.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                    </div>
                </div>

                {/* ── Meal Cards ── */}
                {['breakfast', 'midMorningSnack', 'lunch', 'eveningSnack', 'dinner'].map((meal) => {
                    const { label, icon, isSnack } = MEAL_META[meal];
                    const items = dietChart[meal] || [];
                    const mealCard = isSnack
                        ? { ...cardStyle, background: '#FFFBF2', border: '1px solid rgba(180,131,0,0.18)', boxShadow: '0 2px 8px rgba(180,131,0,0.06)' }
                        : cardStyle;
                    return (
                        <div key={meal} style={mealCard} className="meal-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '20px' }}>{icon}</span>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: isSnack ? '#92610a' : '#36565F', margin: 0 }}>{label}</h3>
                                <span style={{ fontSize: '12px', color: '#5F8190', background: '#F5FAFA', padding: '2px 8px', borderRadius: '20px' }}>
                                    {items.length} item{items.length !== 1 ? 's' : ''}
                                </span>
                                {isSnack && (
                                    <span style={{ fontSize: '11px', color: '#92610a', background: 'rgba(180,131,0,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>snack</span>
                                )}
                            </div>
                            <div style={{ height: '1px', background: '#E2F0F0', marginBottom: '14px' }} />
                            {items.length === 0 ? (
                                <p style={{ color: '#5F8190', fontSize: '13px', fontStyle: 'italic' }}>No items.</p>
                            ) : (
                                items.map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '9px 0',
                                        borderBottom: i < items.length - 1 ? '1px solid #EEF5F5' : 'none',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5F8190', flexShrink: 0 }} />
                                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#141414' }}>
                                                {item.foodItem?.name || item.foodItem}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#5F8190' }}>{item.quantity}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })}

                {/* ── Nutrition Summary ── */}
                <div style={cardStyle}>
                    <SectionTitle>Nutrition Summary</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginTop: '16px' }}>
                        {[
                            { label: 'Calories', unit: 'kcal', value: dietChart.totalNutrients?.calories },
                            { label: 'Protein', unit: 'g', value: dietChart.totalNutrients?.protein },
                            { label: 'Carbs', unit: 'g', value: dietChart.totalNutrients?.carbs },
                            { label: 'Fat', unit: 'g', value: dietChart.totalNutrients?.fat },
                            { label: 'Fiber', unit: 'g', value: dietChart.totalNutrients?.fiber },
                        ].map(({ label, unit, value }) => (
                            <div key={label} style={{ background: '#F5FAFA', padding: '16px 12px', borderRadius: '10px', textAlign: 'center' }}>
                                <p style={{ fontSize: '22px', fontWeight: 700, color: '#36565F', margin: '0 0 4px' }}>
                                    {value ? Math.round(value) : '0'}
                                </p>
                                <p style={{ fontSize: '11px', fontWeight: 500, color: '#5F8190', margin: 0 }}>{label}</p>
                                <p style={{ fontSize: '11px', color: '#93B4BC', margin: '2px 0 0' }}>{unit}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── ICMR RDA Comparison ── */}
                {dietChart.patient?.age && (() => {
                    const rdaData = getRDATargets(dietChart.patient.age, dietChart.patient.gender);
                    const tn = dietChart.totalNutrients || {};
                    const rows = [
                        { label: 'Calories', unit: 'kcal', target: rdaData.calories, achieved: Math.round(tn.calories || 0) },
                        { label: 'Protein', unit: 'g', target: rdaData.protein, achieved: Math.round(tn.protein || 0) },
                        { label: 'Fiber', unit: 'g', target: rdaData.fiber, achieved: Math.round(tn.fiber || 0) },
                        { label: 'Iron', unit: 'mg', target: rdaData.iron, achieved: Math.round(tn.iron || 0) },
                        { label: 'Calcium', unit: 'mg', target: rdaData.calcium, achieved: Math.round(tn.calcium || 0) },
                        { label: 'Vitamin C', unit: 'mg', target: rdaData.vitaminC, achieved: Math.round(tn.vitaminC || 0) },
                    ];
                    return (
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <SectionTitle>ICMR RDA Comparison</SectionTitle>
                                <span style={{ fontSize: '11px', color: '#93B4BC', background: '#F5FAFA', padding: '2px 8px', borderRadius: '20px' }}>
                                    ICMR 2020 Guidelines
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {rows.map(({ label, unit, target, achieved }) => {
                                    const pct = Math.min(Math.round((achieved / target) * 100), 100);
                                    const barColor = pct >= 80 ? '#2f9e6c' : pct >= 50 ? '#d97706' : '#e53e3e';
                                    return (
                                        <div key={label}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#36565F' }}>{label}</span>
                                                <span style={{ fontSize: '12px', color: '#5F8190' }}>
                                                    {achieved} / {target} {unit} &nbsp;
                                                    <span style={{ fontWeight: 700, color: barColor }}>{pct}%</span>
                                                </span>
                                            </div>
                                            <div style={{ height: '7px', background: '#E2F0F0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${pct}%`,
                                                    background: barColor,
                                                    borderRadius: '10px',
                                                    transition: 'width 0.4s ease'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {/* ── Ayurvedic Analysis ── */}
                {(dietChart.ayurvedaAttributes?.viryaBalance || dietChart.ayurvedaAttributes?.agniProfile) && (
                    <div style={cardStyle}>
                        <SectionTitle>Ayurvedic Analysis</SectionTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
                            {dietChart.ayurvedaAttributes?.viryaBalance && (
                                <div style={{ background: '#F5FAFA', padding: '16px', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#5F8190', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
                                        Virya Balance
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#141414', margin: 0 }}>
                                        {dietChart.ayurvedaAttributes.viryaBalance}
                                    </p>
                                </div>
                            )}
                            {dietChart.ayurvedaAttributes?.agniProfile && (
                                <div style={{ background: '#F5FAFA', padding: '16px', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#5F8190', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
                                        Agni Profile
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#141414', margin: 0 }}>
                                        {dietChart.ayurvedaAttributes.agniProfile}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Compliance Notes ── */}
                {dietChart.complianceNotes?.length > 0 && (
                    <div style={cardStyle}>
                        <SectionTitle>Compliance Notes</SectionTitle>
                        <ul style={{ margin: '14px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {dietChart.complianceNotes.map((note, i) => (
                                <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#141414' }}>
                                    <span style={{ color: '#5F8190', flexShrink: 0 }}>·</span>
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── Doctor Notes ── */}
                {dietChart.doctorNotes && (
                    <div style={cardStyle}>
                        <SectionTitle>Doctor Notes</SectionTitle>
                        <p style={{ fontSize: '14px', color: '#141414', lineHeight: 1.7, margin: '12px 0 0', whiteSpace: 'pre-wrap' }}>
                            {dietChart.doctorNotes}
                        </p>
                    </div>
                )}

                {/* ── Footer (print) ── */}
                <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #E2F0F0', color: '#5F8190', fontSize: '12px' }}>
                    <p style={{ margin: 0 }}>Generated {new Date(dietChart.createdAt).toLocaleDateString()} · VedaCare Ayurveda Diet System</p>
                </div>

                <style>{`
                    @media print {
                        /* Hide interactive elements */
                        .no-print { display: none !important; }
                        /* Show print-only header */
                        .print-only { display: block !important; }
                        /* Page reset */
                        body { background: #fff !important; margin: 0; font-size: 11pt; font-family: Arial, sans-serif; }
                        /* Meal cards should not break across pages */
                        .meal-card { page-break-inside: avoid; break-inside: avoid; }
                        /* Remove box shadows and backgrounds for ink efficiency */
                        div[style*="boxShadow"], div[style*="box-shadow"] {
                            box-shadow: none !important;
                        }
                        /* Heading sizes */
                        h1 { font-size: 20pt !important; }
                        h3 { font-size: 13pt !important; }
                        p, span, td, li { font-size: 11pt !important; }
                        /* RDA progress bars: preserve color for clinical reading */
                        .rda-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        /* Layout: maximum print width */
                        .print-root { max-width: 100% !important; padding: 0 !important; }
                    }
                    @media (max-width: 640px) {
                        .summary-grid { grid-template-columns: 1fr 1fr !important; }
                    }
                `}</style>
            </div>
        </div>
    );
};

/* ── Shared style objects ── */
const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    marginBottom: '20px',
};

const primaryBtn = {
    padding: '10px 18px', background: '#36565F', border: 'none',
    borderRadius: '8px', color: '#FFFFFF', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s ease',
};

const outlineBtn = {
    padding: '9px 16px', background: 'transparent',
    border: '1px solid #5F8190', borderRadius: '8px',
    color: '#36565F', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', transition: 'background 0.18s',
};

const pill = {
    display: 'inline-block', fontSize: '12px', fontWeight: 600,
    background: 'rgba(54,86,95,0.08)', color: '#36565F',
    padding: '3px 10px', borderRadius: '20px',
};

/* ── Helper components ── */
const SectionTitle = ({ children }) => (
    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#36565F', margin: 0 }}>{children}</h3>
);

const InfoField = ({ label, value, badge }) => (
    <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#5F8190', textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 4px' }}>
            {label}
        </p>
        {badge ? (
            <span style={{
                display: 'inline-block', background: 'rgba(95,129,144,0.15)',
                color: '#36565F', padding: '4px 12px', borderRadius: '20px',
                fontSize: '13px', fontWeight: 500,
            }}>{badge}</span>
        ) : (
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#141414', margin: 0 }}>{value || '—'}</p>
        )}
    </div>
);

export default DietChart;
