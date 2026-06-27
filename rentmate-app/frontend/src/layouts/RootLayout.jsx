// Main Guest Layout wrapper
// Purpose: Wraps public headers, central components routing outputs, and footers.
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar.jsx';
import Footer from '../components/Layout/Footer.jsx';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-x-hidden">
      {/* Decorative top background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent pointer-events-none -z-10" />
      
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-all duration-300">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}

