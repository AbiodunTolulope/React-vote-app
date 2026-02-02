import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/">
                        <span className="brand-icon">🗳️</span>
                        <span className="brand-text">Poll Point</span>
                    </Link>
                </div>

                <div className="navbar-links">
                    {user ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/create-poll"
                                className={`nav-link ${isActive('/create-poll') ? 'active' : ''}`}
                            >
                                Create Poll
                            </Link>
                        </>
                    ) : (
                        <Link to="/login" className="nav-link">Log In</Link>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu">
                            <span className="user-email">{user.email}</span>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                Log Out
                            </Button>
                        </div>
                    ) : (
                        location.pathname !== '/signup' && (
                            <Button size="sm" onClick={() => navigate('/signup')}>
                                Sign Up Free
                            </Button>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
