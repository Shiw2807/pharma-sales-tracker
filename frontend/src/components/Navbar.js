import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          💊 Pharma Sales Tracker
        </Link>
        
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/sales" className="navbar-link">
            Sales
          </Link>
          {isManager && (
            <Link to="/reports" className="navbar-link">
              Reports
            </Link>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-info">
            👤 {user?.name} ({user?.role?.replace('_', ' ')})
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;