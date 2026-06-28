// Sign-In/Register layout shell
// Purpose: Formats forms layouts centered on screen.
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden px-4 py-12">
      {/* Background radial glow shapes */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* Main Branding Logo inside Auth flow */}
      <div className="mb-8 text-center z-10">
        <Link to="/" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          RentMate
        </Link>
        <p className="text-xs text-slate-500 mt-2 font-medium">Find your perfect home-away-from-home</p>
      </div>

      <div className="max-w-md w-full z-10 dark-glass-effect p-8 sm:p-10 rounded-2xl shadow-2xl transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
}

