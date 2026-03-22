import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClinicDetail = () => {
    const { clinicId } = useParams();
    const navigate = useNavigate();
    const [clinic, setClinic] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form states
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [showEditClinicForm, setShowEditClinicForm] = useState(false);
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        role: 'DOCTOR',
        phone: '',
        specialization: '',
        qualification: '',
        experience: 0,
        licenseNumber: ''
    });
    const [clinicFormData, setClinicFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Credentials state
    const [revealedCredentials, setRevealedCredentials] = useState({});
    const [credentialsData, setCredentialsData] = useState({});

    useEffect(() => {
        fetchClinicDetail();
    }, [clinicId]);

    const fetchClinicDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/admin/clinic/${clinicId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setClinic(response.data.data.clinic);
            setUsers(response.data.data.users);
            setClinicFormData({
                name: response.data.data.clinic.name,
                email: response.data.data.clinic.email || '',
                phone: response.data.data.clinic.phone || '',
                address: response.data.data.clinic.address || ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch clinic details');
        } finally {
            setLoading(false);
        }
    };

    const handleUserChange = (e) => {
        const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
        setUserFormData({ ...userFormData, [e.target.name]: value });
    };

    const handleClinicChange = (e) => {
        setClinicFormData({ ...clinicFormData, [e.target.name]: e.target.value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/admin/create-user',
                { ...userFormData, clinicId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setShowAddUserForm(false);
            setUserFormData({
                name: '', email: '', role: 'DOCTOR', phone: '',
                specialization: '', qualification: '', experience: 0, licenseNumber: ''
            });
            fetchClinicDetail();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleUpdateClinic = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/admin/clinic/${clinicId}`,
                clinicFormData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setShowEditClinicForm(false);
            fetchClinicDetail();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update clinic');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/admin/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchClinicDetail();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleDeleteClinic = async () => {
        if (!window.confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/admin/clinic/${clinicId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete clinic');
        }
    };

    const toggleCredentials = async (userId) => {
        if (revealedCredentials[userId]) {
            setRevealedCredentials({ ...revealedCredentials, [userId]: false });
        } else {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/admin/user/${userId}/credentials`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCredentialsData({ ...credentialsData, [userId]: response.data.data });
                setRevealedCredentials({ ...revealedCredentials, [userId]: true });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch credentials');
            }
        }
    };

    if (loading) return (
        <div className="cd-loading">Loading...</div>
    );

    return (
        <div className="cd-page">
            <div className="cd-container">

                {/* Back link */}
                <button className="cd-back-link" onClick={() => navigate('/dashboard')}>
                    ← Back to Clinics
                </button>

                {/* Error */}
                {error && (
                    <div className="cd-error animate-slide-down">{error}</div>
                )}

                {/* ── Clinic Overview Card ── */}
                <div className="cd-card">
                    <div className="cd-card-header">
                        <div className="cd-clinic-info">
                            <h1 className="cd-clinic-name">{clinic?.name}</h1>
                            <div className="cd-clinic-meta">
                                {clinic?.email && (
                                    <span className="cd-meta-item">
                                        <span className="cd-meta-label">Email</span>
                                        {clinic.email}
                                    </span>
                                )}
                                {clinic?.phone && (
                                    <span className="cd-meta-item">
                                        <span className="cd-meta-label">Phone</span>
                                        {clinic.phone}
                                    </span>
                                )}
                                {clinic?.address && (
                                    <span className="cd-meta-item">
                                        <span className="cd-meta-label">Address</span>
                                        {clinic.address}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="cd-card-actions">
                            <button
                                className="cd-btn-secondary"
                                onClick={() => setShowEditClinicForm(!showEditClinicForm)}
                            >
                                {showEditClinicForm ? 'Cancel' : 'Edit Clinic'}
                            </button>
                            <button
                                className="cd-btn-danger"
                                onClick={handleDeleteClinic}
                            >
                                Delete Clinic
                            </button>
                        </div>
                    </div>

                    {/* Edit Clinic Form */}
                    {showEditClinicForm && (
                        <div className="cd-form-panel">
                            <form onSubmit={handleUpdateClinic}>
                                <div className="cd-form-grid">
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Name *</label>
                                        <input
                                            type="text" name="name" required
                                            value={clinicFormData.name}
                                            onChange={handleClinicChange}
                                            className="cd-form-input"
                                        />
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Email</label>
                                        <input
                                            type="email" name="email"
                                            value={clinicFormData.email}
                                            onChange={handleClinicChange}
                                            className="cd-form-input"
                                        />
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Phone</label>
                                        <input
                                            type="text" name="phone"
                                            value={clinicFormData.phone}
                                            onChange={handleClinicChange}
                                            className="cd-form-input"
                                        />
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Address</label>
                                        <input
                                            type="text" name="address"
                                            value={clinicFormData.address}
                                            onChange={handleClinicChange}
                                            className="cd-form-input"
                                        />
                                    </div>
                                </div>
                                <div className="cd-form-footer">
                                    <button type="submit" className="cd-btn-primary">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* ── Doctors Section ── */}
                <div className="cd-card">
                    <div className="cd-section-header">
                        <h2 className="cd-section-title">Doctors &amp; Dietitians</h2>
                        <button
                            className="cd-btn-primary"
                            onClick={() => setShowAddUserForm(!showAddUserForm)}
                        >
                            {showAddUserForm ? 'Cancel' : '+ Add Doctor'}
                        </button>
                    </div>

                    {/* Add Doctor Form */}
                    {showAddUserForm && (
                        <div className="cd-form-panel">
                            <form onSubmit={handleAddUser}>
                                <div className="cd-form-grid">
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Name *</label>
                                        <input type="text" name="name" required value={userFormData.name} onChange={handleUserChange} className="cd-form-input" placeholder="Dr. John Smith" />
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Email *</label>
                                        <input type="email" name="email" required value={userFormData.email} onChange={handleUserChange} className="cd-form-input" />
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Role *</label>
                                        <select name="role" value={userFormData.role} onChange={handleUserChange} className="cd-form-input">
                                            <option value="DOCTOR">Doctor</option>
                                            <option value="DIETITIAN">Dietitian</option>
                                        </select>
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Phone</label>
                                        <input type="text" name="phone" value={userFormData.phone} onChange={handleUserChange} className="cd-form-input" />
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Specialization</label>
                                        <input type="text" name="specialization" value={userFormData.specialization} onChange={handleUserChange} className="cd-form-input" />
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Qualification</label>
                                        <input type="text" name="qualification" value={userFormData.qualification} onChange={handleUserChange} className="cd-form-input" />
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">Experience (years)</label>
                                        <input type="number" name="experience" min="0" value={userFormData.experience} onChange={handleUserChange} className="cd-form-input" />
                                    </div>
                                    <div className="cd-form-field">
                                        <label className="cd-form-label">License Number</label>
                                        <input type="text" name="licenseNumber" value={userFormData.licenseNumber} onChange={handleUserChange} className="cd-form-input" />
                                    </div>
                                </div>
                                <div className="cd-form-footer">
                                    <button type="submit" className="cd-btn-primary">Create Doctor</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Divider */}
                    {(users.length > 0 || showAddUserForm) && <div className="cd-divider" />}

                    {/* Doctor Cards */}
                    {users.length === 0 ? (
                        <p className="cd-empty">No doctors added yet.</p>
                    ) : (
                        <div className="cd-doctor-list">
                            {users.map((user) => (
                                <div key={user._id} className="cd-doctor-card">

                                    {/* Left: Identity */}
                                    <div className="cd-doctor-left">
                                        <div className="cd-doctor-name-row">
                                            <span className="cd-doctor-name">{user.name}</span>
                                            <span className="cd-role-badge">{user.role}</span>
                                        </div>
                                        <span className="cd-doctor-email">{user.email}</span>
                                        {user.specialization && (
                                            <span className="cd-doctor-spec">{user.specialization}</span>
                                        )}
                                    </div>

                                    {/* Middle: Credentials */}
                                    <div className="cd-credentials">
                                        <div className="cd-cred-row">
                                            <span className="cd-cred-label">Username</span>
                                            <code className="cd-cred-value">
                                                {revealedCredentials[user._id]
                                                    ? credentialsData[user._id]?.username
                                                    : (credentialsData[user._id]?.maskedUsername || user.username.substring(0, 2) + '••••' + user.username.substring(user.username.length - 2))}
                                            </code>
                                        </div>
                                        <div className="cd-cred-row">
                                            <span className="cd-cred-label">Password</span>
                                            <code className="cd-cred-value">
                                                {revealedCredentials[user._id]
                                                    ? credentialsData[user._id]?.password
                                                    : '••••••••'}
                                            </code>
                                        </div>
                                        <button
                                            className="cd-btn-reveal"
                                            onClick={() => toggleCredentials(user._id)}
                                        >
                                            {revealedCredentials[user._id] ? 'Hide' : 'View'}
                                        </button>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="cd-doctor-actions">
                                        <button
                                            className="cd-btn-delete"
                                            onClick={() => handleDeleteUser(user._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClinicDetail;
