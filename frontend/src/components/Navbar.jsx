import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const displayName = user?.role === 'ADMIN'
        ? 'System Administrator'
        : (user?.name || 'Unknown');

    return (
        <header className="navbar">
            <Link to="/dashboard" className="logo-container">
                <img
                    src="/assets/logo-icon.png"
                    alt="VedaCare Logo"
                    className="logo-icon"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/logo.png';
                    }}
                />
                <span className="brand-name">VedaCare</span>
            </Link>

            <div className="user-section" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link to="/foods/add" style={{ color: '#5F8190', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>+ Add Food</Link>
                <span className="user-name">{displayName}</span>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;
