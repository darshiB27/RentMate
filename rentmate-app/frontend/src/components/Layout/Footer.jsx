// Footer component
// Purpose: Displays standard contact, branding, and navigation footer listings.
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Branding Column */}
        <div className="space-y-4">
          <h3 className="text-white font-extrabold text-xl tracking-tight">RentMate</h3>
          <p className="text-sm text-slate-500">
            Making finding and renting verified rooms, PGs, and hostels painless and reliable.
          </p>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/search" className="hover:text-white transition-colors">Search Listings</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
            </li>
          </ul>
        </div>

        {/* Roles Links */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Portals</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/login" className="hover:text-white transition-colors">Tenant Login</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white transition-colors">Owner Console</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white transition-colors">Admin Portal</Link>
            </li>
          </ul>
        </div>

        {/* Address / Contact info */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact</h4>
          <p className="text-sm text-slate-500 mb-2">support@rentmate.com</p>
          <p className="text-sm text-slate-500">123 RentMate Avenue, Suite 100</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} RentMate. All rights reserved. Made for MERN pair development.
      </div>
    </footer>
  );
}

