// Member Account Layout Dashboard shell
// Purpose: Wraps navigational sidebars and dashboard content layout sub-routers.
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar.jsx';
import Sidebar from '../components/Layout/Sidebar.jsx';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

