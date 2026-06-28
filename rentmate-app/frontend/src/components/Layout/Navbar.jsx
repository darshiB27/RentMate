// Global Navigation Header Component
// Purpose: Displays logo, search queries routing, wishlist alerts, and user avatar dropdowns.
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice.js';
import { ROLE_DASHBOARDS } from '../../constants/roles.js';
import NotificationDropdown from '../../features/notifications/components/NotificationDropdown.jsx';

export default function Navbar() {
  const { user, token } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-slate-200/50 px-6 py-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent transition-all duration-300 hover:opacity-95">
          RentMate
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink to="/search" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`}>
            Explore
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`}>
            Contact
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {token && user ? (
          <>
            {/* Notification Badge indicator */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors focus:outline-hidden cursor-pointer"
                title="View recent alerts"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
            </div>

            {/* User details and Dashboard link */}
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{user.name || 'User'}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{user.role}</p>
              </div>
              <Link to={ROLE_DASHBOARDS[user.role]} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all duration-200">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-slate-500 hover:text-rose-600 p-2 transition-colors" title="Sign Out">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-lg shadow-xs hover:opacity-95 hover:shadow-sm transition-all duration-200">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

