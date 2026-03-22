import { useState } from 'react';
import { visitAPI } from '../api/api';

const CreateVisitModal = ({ patientId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        visitDate: new Date().toISOString().split('T')[0],
        chiefComplaint: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Inline validation — never rely on HTML required attribute alone
        if (!formData.chiefComplaint.trim()) {
            setError('Chief Complaint is required.');
            return;
        }
        if (!formData.visitDate) {
            setError('Visit Date is required.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('[CreateVisit] Calling POST /visits with patientId:', patientId);
            const response = await visitAPI.create({
                patientId,
                visitDate: formData.visitDate,
                chiefComplaint: formData.chiefComplaint.trim(),
                notes: formData.notes.trim()
            });

            const createdVisit = response.data.data;
            console.log('[CreateVisit] Visit created successfully:', createdVisit._id);

            // Notify parent — parent handles navigation
            onSuccess(createdVisit);
        } catch (err) {
            console.error('[CreateVisit] Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to create visit. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px'
            }}
        >
            <div
                style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '28px',
                    width: '100%',
                    maxWidth: '480px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#36565F', margin: 0 }}>
                        Create New Visit
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#5F8190',
                            fontSize: '20px',
                            lineHeight: 1,
                            padding: '4px'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: '#FFF0F0',
                        borderLeft: '4px solid #e53e3e',
                        padding: '12px 16px',
                        borderRadius: '0 8px 8px 0',
                        marginBottom: '20px',
                        color: '#c53030',
                        fontSize: '14px',
                        fontWeight: 500
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    {/* Visit Date */}
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5F8190', marginBottom: '6px' }}>
                            Visit Date *
                        </label>
                        <input
                            type="date"
                            name="visitDate"
                            value={formData.visitDate}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #D0E4E8',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#141414',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Chief Complaint */}
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5F8190', marginBottom: '6px' }}>
                            Chief Complaint *
                        </label>
                        <input
                            type="text"
                            name="chiefComplaint"
                            value={formData.chiefComplaint}
                            onChange={handleChange}
                            placeholder="e.g., Follow-up consultation, Digestive issues"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: `1px solid ${error && !formData.chiefComplaint.trim() ? '#e53e3e' : '#D0E4E8'}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#141414',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5F8190', marginBottom: '6px' }}>
                            Notes <span style={{ fontWeight: 400 }}>(optional)</span>
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Additional clinical notes..."
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #D0E4E8',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#141414',
                                outline: 'none',
                                resize: 'vertical',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '11px',
                                border: '1px solid #D0E4E8',
                                borderRadius: '8px',
                                background: 'transparent',
                                color: '#5F8190',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '11px',
                                border: 'none',
                                borderRadius: '8px',
                                background: loading ? '#93b4bc' : '#36565F',
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s ease'
                            }}
                        >
                            {loading ? 'Creating Visit...' : 'Create Visit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateVisitModal;
