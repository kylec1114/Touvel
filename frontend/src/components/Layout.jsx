import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Touvel</h3>
            <p>Your personal travel planning companion</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Bookings</a></li>
              <li><a href="#">Profile</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Instagram</a>
              <a href="#" className="social-link">Twitter</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Touvel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
