import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

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
            const response = await authAPI.login(formData);
            const { data } = response.data;

            login(
                {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    clinic: data.clinic
                },
                data.token
            );

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                {/* Header */}
                <div className="login-header">
                    <img
                        src="/assets/logo-full.png"
                        alt="VedaCare"
                        className="login-logo"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/logo.png';
                        }}
                    />
                    <h1 className="login-brand">VedaCare</h1>
                    <p className="login-subtitle">Ayurvedic Diet Management</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">

                    {/* Error */}
                    {error && (
                        <div className="login-error animate-slide-down">
                            {error}
                        </div>
                    )}

                    {/* Username */}
                    <div className="login-field">
                        <label htmlFor="username" className="login-label">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            className="login-input"
                        />
                    </div>

                    {/* Password */}
                    <div className="login-field">
                        <label htmlFor="password" className="login-label">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="login-input"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="login-btn"
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                {/* Footer */}
                <p className="login-footer">© 2026 VedaCare. Powered by ancient wisdom.</p>
            </div>
        </div>
    );
};

export default Login;
