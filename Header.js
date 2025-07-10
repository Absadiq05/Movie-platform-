// client/src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css'; // Basic styling for header

function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <nav className="navbar">
                <Link to="/" className="logo">MovieApp</Link>
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    {user ? (
                        <>
                            <li><Link to="/profile">Profile</Link></li>
                            <li><button onClick={logout} className="logout-btn">Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;
      
