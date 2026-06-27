import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../features/admin/services/adminApi.js';
import { formatCurrency } from '../utils/formatters.js';

export default function Reports() {
  // Fetch stats details
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['adminReportsStats'],
    queryFn: () => getDashboardStats().then((res) => res.data?.data || {}),
  });

  const platform = statsResponse?.platform || {};
  const users = platform.users || { total: 0, owners: 0, tenants: 0, blocked: 0 };
  const properties = platform.properties || { total: 0, pending: 0, approved: 0, rejected: 0 };
  const inquiries = platform.inquiries || { total: 0, pending: 0 };
  const topListings = statsResponse?.topListings || [];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
            System Reports
          </h1>
          <p className="text-sm text-slate-400">Review platform metrics, occupancy breakdowns, and top-performing listings details.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 print:hidden"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-pulse h-60" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-pulse h-40" />
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-pulse h-40" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Properties Verification Breakdown Chart */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Property Listings Breakdown</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Verification status of properties uploaded by owners</p>
              </div>

              {/* Custom SVG Bar Chart */}
              <div className="space-y-4">
                {/* Approved */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Approved Stay Listings</span>
                    <span className="text-slate-800">{properties.approved} ({properties.total > 0 ? Math.round((properties.approved / properties.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${properties.total > 0 ? (properties.approved / properties.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Pending */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Awaiting Verification Review</span>
                    <span className="text-slate-800">{properties.pending} ({properties.total > 0 ? Math.round((properties.pending / properties.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${properties.total > 0 ? (properties.pending / properties.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Rejected */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Rejected Listings</span>
                    <span className="text-slate-800">{properties.rejected} ({properties.total > 0 ? Math.round((properties.rejected / properties.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${properties.total > 0 ? (properties.rejected / properties.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Registrations user role breakdown */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">User Registration Ratios</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Ratio of tenants vs. owners registered on the platform</p>
              </div>

              {/* Custom SVG Bar Chart */}
              <div className="space-y-4">
                {/* Tenants */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Tenants</span>
                    <span className="text-slate-800">{users.tenants} ({users.total > 0 ? Math.round((users.tenants / users.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${users.total > 0 ? (users.tenants / users.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Owners */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Owners</span>
                    <span className="text-slate-800">{users.owners} ({users.total > 0 ? Math.round((users.owners / users.total) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${users.total > 0 ? (users.owners / users.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top-performing properties listing table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Top Rated Stay Listings</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Top listings sorted by average occupant feedback reviews ratings.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="px-6 py-4">Stay Description</th>
                    <th className="px-6 py-4 text-center">Reviews count</th>
                    <th className="px-6 py-4 text-center">Average Rating</th>
                    <th className="px-6 py-4 text-right">Rent Pricing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {topListings.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-slate-400">
                        No reviews or properties aggregated yet.
                      </td>
                    </tr>
                  ) : (
                    topListings.map((listing) => (
                      <tr key={listing._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 font-extrabold text-slate-800">
                          {listing.title}
                          <span className="block text-[9px] text-slate-400 font-semibold mt-0.5 uppercase">
                            {listing.type} • {listing.genderCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 font-bold">
                          {listing.ratingCount || 0} reviews
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            ★ {listing.ratingAverage || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-indigo-600 font-black">
                          {formatCurrency(listing.price || 0)} / mo
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
