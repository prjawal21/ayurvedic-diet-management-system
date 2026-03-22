import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [clinics, setClinics] = useState([]);
    const [showCreateClinicForm, setShowCreateClinicForm] = useState(false);
    const [clinicFormData, setClinicFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/admin/clinics', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setClinics(response.data.data);
            setTotalDoctors(response.data.totalDoctors ?? 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch clinics');
        } finally {
            setLoading(false);
        }
    };

    const handleClinicChange = (e) => {
        setClinicFormData({
            ...clinicFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateClinic = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/admin/create-clinic',
                clinicFormData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setShowCreateClinicForm(false);
            setClinicFormData({ name: '', address: '', phone: '', email: '' });
            fetchClinics();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create clinic');
        }
    };

    const handleClinicClick = (clinicId) => {
        navigate(`/admin/clinic/${clinicId}`);
    };

    const filteredClinics = clinics.filter(clinic =>
        clinic?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#E2F0F0' }}>
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-[#E2F0F0] rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#36565F] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="meta-text font-medium">Loading clinics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: '#E2F0F0' }}>
            {/* Main Content */}
            <main className="dashboard-container">
                {/* Page Header */}
                <div className="section-spacing-xl">
                    <div className="action-row">
                        <div>
                            <h2 className="page-title mb-2">Clinic Management</h2>
                            <p className="section-subtitle">Manage all clinics and their doctors</p>
                        </div>
                        <button
                            onClick={() => setShowCreateClinicForm(!showCreateClinicForm)}
                            className="primary-btn"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {showCreateClinicForm ? 'Cancel' : 'Create New Clinic'}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="search-wrapper">
                        <svg className="search-icon h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search clinics by name or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stats-card">
                        <div className="stats-card-value">{clinics.length}</div>
                        <div className="stats-card-label">Total Clinics</div>
                    </div>
                    <div className="stats-card">
                        <div className="stats-card-value">{totalDoctors}</div>
                        <div className="stats-card-label">Total Doctors</div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-slide-down">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {/* Create Clinic Form */}
                {showCreateClinicForm && (
                    <div className="ccf-wrap animate-slide-down">
                        <div className="ccf-card">
                            <h3 className="ccf-title">Create New Clinic</h3>
                            <form onSubmit={handleCreateClinic} className="ccf-form">
                                <div className="ccf-grid">
                                    <div className="ccf-field">
                                        <label className="ccf-label">Clinic Name *</label>
                                        <input
                                            type="text" name="name" required
                                            value={clinicFormData.name}
                                            onChange={handleClinicChange}
                                            className="ccf-input"
                                            placeholder="Wellness Ayurveda Clinic"
                                        />
                                    </div>
                                    <div className="ccf-field">
                                        <label className="ccf-label">Email</label>
                                        <input
                                            type="email" name="email"
                                            value={clinicFormData.email}
                                            onChange={handleClinicChange}
                                            className="ccf-input"
                                            placeholder="clinic@example.com"
                                        />
                                    </div>
                                    <div className="ccf-field">
                                        <label className="ccf-label">Phone</label>
                                        <input
                                            type="text" name="phone"
                                            value={clinicFormData.phone}
                                            onChange={handleClinicChange}
                                            className="ccf-input"
                                            placeholder="+91-9876543210"
                                        />
                                    </div>
                                    <div className="ccf-field">
                                        <label className="ccf-label">Address</label>
                                        <input
                                            type="text" name="address"
                                            value={clinicFormData.address}
                                            onChange={handleClinicChange}
                                            className="ccf-input"
                                            placeholder="123 Main Street, Mumbai"
                                        />
                                    </div>
                                </div>
                                <div className="ccf-footer">
                                    <button
                                        type="button"
                                        className="ccf-btn-cancel"
                                        onClick={() => setShowCreateClinicForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="ccf-btn-submit">
                                        Create Clinic
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Clinics Grid */}
                {filteredClinics.length === 0 ? (
                    <div className="card-base p-12 text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <svg className="w-20 h-20 text-[#5F8190]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="section-title mb-2">No Clinics Found</h3>
                        <p className="meta-text mb-6 text-base">
                            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first clinic to get started'}
                        </p>
                        {!searchTerm && !showCreateClinicForm && (
                            <button onClick={() => setShowCreateClinicForm(true)} className="primary-btn">
                                Create Your First Clinic
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-0">
                        {filteredClinics.map((clinic) => (
                            <div
                                key={clinic._id}
                                onClick={() => handleClinicClick(clinic._id)}
                                className="clinic-card-horizontal"
                            >
                                {/* Left Section */}
                                <div className="clinic-card-left">
                                    <div className="clinic-card-title-row">
                                        <h3 className="card-title">{clinic.name}</h3>
                                        <span className="status-badge-custom">Active</span>
                                    </div>
                                    <div className="clinic-card-contact">
                                        {clinic.email && (
                                            <div className="clinic-card-contact-item">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span>{clinic.email}</span>
                                            </div>
                                        )}
                                        {clinic.phone && (
                                            <div className="clinic-card-contact-item">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span>{clinic.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className="clinic-card-right">
                                    <svg className="arrow-shift w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Footer */}
                {filteredClinics.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="meta-text font-medium">
                            Showing <span className="font-bold" style={{ color: '#36565F' }}>{filteredClinics.length}</span> of <span className="font-bold" style={{ color: '#36565F' }}>{clinics.length}</span> clinics
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
