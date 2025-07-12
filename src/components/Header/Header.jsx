import React from 'react';
import { User, LogOut } from 'lucide-react';
import './Header.css';

export const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          {/* <img 
            src="/logo/imglogo.png" // Replace with your actual logo path
            alt="Company Logo" 
            className="logo"
          /> */}
          <h2 className="header-title">
            {user.type === 'admin' ? 'Admin Dashboard' : 'Employee Assessment'}
          </h2>
        </div>
        <div className="user-section">
          <div className="user-info">
            <User size={20} />
            <span>{user.type === 'admin' ? 'Administrator' : user.name}</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};