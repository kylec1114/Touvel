import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">✈️</span>
          <span className="logo-text">Touvel</span>
        </Link>
        
        <nav className="nav-menu">
          <Link to="/" className="nav-link">首頁</Link>
          <Link to="/products" className="nav-link">探索產品</Link>
          <Link to="/ai-itinerary" className="nav-link">🤖 AI 行程</Link>
          {user && user.role === 'supplier' && (
            <Link to="/supplier/dashboard" className="nav-link">供應商後台</Link>
          )}
          {user && user.role === 'traveler' && (
            <Link to="/my-bookings" className="nav-link">我的預訂</Link>
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="user-greeting">
                歡迎，{user.firstName || user.email}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                登出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">登入</Link>
              <Link to="/register" className="btn-register">註冊</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
