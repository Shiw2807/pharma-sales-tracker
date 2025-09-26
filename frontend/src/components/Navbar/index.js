import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💊</span>
          <span className="brand-text">Pharma Sales Tracker</span>
        </Link>

        <div className="navbar-menu">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/sales"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Sales
          </NavLink>
          {isManager && (
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              Reports
            </NavLink>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-info-desktop">
            👤 {user?.name} ({user?.role?.replace("_", " ")})
          </span>
          <button onClick={handleLogout} className="btn-logout desktop-only">
            Logout
          </button>

          <div
            className="user-dropdown-container mobile-only"
            ref={dropdownRef}
          >
            <button
              className="user-dropdown-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="User menu"
            >
              👤
            </button>
            {showDropdown && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-info">
                  <strong>{user?.name}</strong>
                  <small>{user?.role?.replace("_", " ")}</small>
                </div>
                <button onClick={handleLogout} className="dropdown-logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;