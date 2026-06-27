import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardStats, getProperties, approveProperty, rejectProperty } from '../features/admin/services/adminApi.js';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  // Fetch Platform stats
  const { data: statsResponse, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => getDashboardStats().then((res) => res.data?.data || {}),
  });

  // Fetch recent pending properties for quick actions
  const { data: pendingResponse, isLoading: pendingLoading } = useQuery({
    queryKey: ['recentPendingProperties'],
    queryFn: () => getProperties({ page: 1, limit: 5, verificationStatus: 'pending' }).then((res) => res.data?.data?.properties || []),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id) => approveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentPendingProperties'] });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectProperty(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentPendingProperties'] });
    },
  });

  const handleApprove = (id) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id) => {
    const reason = prompt('Please enter the reason for rejection (optional):') || 'Does not meet requirements';
    rejectMutation.mutate({ id, reason });
  };

  const platform = statsResponse?.platform || {};
  const users = platform.users || { total: 0, owners: 0, tenants: 0, blocked: 0 };
  const properties = platform.properties || { total: 0, pending: 0, approved: 0, rejected: 0 };
  const inquiries = platform.inquiries || { total: 0, pending: 0 };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
          Platform Overview
        </h1>
        <p className="text-sm text-slate-400">Platform KPIs, registration statistics, and quick administrative shortcuts.</p>
      </div>

      {/* KPI Cards Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-pulse h-36" />
          ))}
        </div>
      ) : statsError ? (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-2xl text-center max-w-md mx-auto text-sm font-semibold">
          Failed to load stats details. {statsError.message}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Users Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Registrations</span>
              <p className="text-3xl font-black text-slate-800">{users.total}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-50 mt-2">
                <span><strong className="text-slate-700">{users.tenants}</strong> Tenants</span>
                <span><strong className="text-slate-700">{users.owners}</strong> Owners</span>
                <span className="text-rose-500 font-bold">{users.blocked} Blocked</span>
              </div>
            </div>
          </div>

          {/* Properties Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stay Listings</span>
              <p className="text-3xl font-black text-slate-800">{properties.total}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-50 mt-2">
                <span className="text-emerald-600 font-bold">{properties.approved} Approved</span>
                <span className="text-amber-500 font-bold">{properties.pending} Pending</span>
                <span className="text-rose-500 font-bold">{properties.rejected} Rejected</span>
              </div>
            </div>
          </div>

          {/* Inquiries Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-4">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tenant Inquiries</span>
              <p className="text-3xl font-black text-slate-800">{inquiries.total}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-50 mt-2">
                <span><strong className="text-slate-700">{inquiries.pending}</strong> Pending reviews</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Pending Properties & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Properties Feed */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Awaiting Verification ({properties.pending})</h3>
            <Link to="/admin/properties" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Manage All Properties
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse font-semibold">
                Loading properties...
              </div>
            ) : !pendingResponse || pendingResponse.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <p className="text-xs font-semibold text-slate-500">All caught up!</p>
                <p className="text-[10px] text-slate-400 mt-0.5">There are no pending listings to approve.</p>
              </div>
            ) : (
              pendingResponse.map((prop) => (
                <div key={prop._id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{prop.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">
                      By <span className="font-semibold text-slate-600">{prop.ownerId?.name || 'Unknown'}</span> ({prop.ownerId?.email})
                    </p>
                    <span className="inline-block text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md mt-2 uppercase tracking-wide">
                      {prop.type} • {prop.sharingType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(prop._id)}
                      disabled={approveMutation.isPending}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(prop._id)}
                      disabled={rejectMutation.isPending}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admin Shortcuts Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide border-b border-slate-50 pb-3">Administrative shortcuts</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-indigo-50/30 hover:border-indigo-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Manage Users</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verify owners and account blocks</p>
                </div>
              </div>
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/admin/properties"
              className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-emerald-50/30 hover:border-emerald-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Manage Listings</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Approve or reject stay listings</p>
                </div>
              </div>
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/admin/reports"
              className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-cyan-50/30 hover:border-cyan-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">System Reports</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Review platform growth logs</p>
                </div>
              </div>
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
