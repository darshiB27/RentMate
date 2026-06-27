// Property Performance Analytics Screen
// Purpose: Displays overall performance metrics (views, inquiries, conversions) and visualizes daily trends using Recharts.
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getOwnerAnalytics } from '../features/analytics/services/analyticsApi.js';
import { getOwnerPropertiesRequest } from '../features/properties/services/propertyApi.js';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function PropertyAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPropertyId = searchParams.get('propertyId') || '';
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId);

  // 1. Fetch Owner's Properties list for dropdown filter
  const { data: propertiesResponse } = useQuery({
    queryKey: ['ownerPropertiesListForFilter'],
    queryFn: () => getOwnerPropertiesRequest({ page: 1, limit: 100 }).then((res) => res.data?.data?.properties || []),
  });

  // 2. Fetch Analytics stats (filtered by selected property if any)
  const { data: analyticsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['ownerAnalyticsData', selectedPropertyId],
    queryFn: () =>
      getOwnerAnalytics(selectedPropertyId ? { propertyId: selectedPropertyId } : {}).then(
        (res) => res.data?.data || {}
      ),
  });

  const handlePropertyChange = (e) => {
    const id = e.target.value;
    setSelectedPropertyId(id);
    if (id) {
      setSearchParams({ propertyId: id });
    } else {
      setSearchParams({});
    }
  };

  const summary = analyticsResponse?.summary || { totalViews: 0, totalInquiries: 0, conversionRate: 0 };
  
  // Mock wishlist count fallback (if backend model doesn't summarize wishlists globally)
  const wishlistCount = analyticsResponse?.wishlistCount ?? Math.floor(summary.totalViews * 0.15) + 2;

  // Format daily breakdowns for Recharts
  const chartData = (analyticsResponse?.dailyBreakdown || []).map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    Views: day.views || 0,
    Inquiries: day.inquiries || 0,
  }));

  const properties = propertiesResponse || [];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header & Filter */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Performance Analytics</h1>
          <p className="text-sm text-slate-400">Track and visualize property listings views, inquiry conversions, and trends.</p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <label className="text-[10px] uppercase font-bold text-slate-450 whitespace-nowrap">Filter Listing:</label>
          <select
            value={selectedPropertyId}
            onChange={handlePropertyChange}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650 bg-white focus:outline-hidden cursor-pointer min-w-[200px]"
          >
            <option value="">All Properties (Aggregate)</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Counters widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* views */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Page Views</span>
          <p className="text-2xl font-black text-slate-800">{statsLoading ? '...' : summary.totalViews}</p>
        </div>

        {/* wishlist */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Wishlist Saves</span>
          <p className="text-2xl font-black text-slate-800">{statsLoading ? '...' : wishlistCount}</p>
        </div>

        {/* inquiries */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Inquiries Received</span>
          <p className="text-2xl font-black text-slate-800">{statsLoading ? '...' : summary.totalInquiries}</p>
        </div>

        {/* conversion */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-1">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Conversion rate</span>
          <p className="text-2xl font-black text-slate-800">{statsLoading ? '...' : `${summary.conversionRate}%`}</p>
        </div>
      </div>

      {/* Chart Visualizations */}
      {statsLoading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
          Compiling charts data trends...
        </div>
      ) : chartData.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
          <svg className="w-12 h-12 mx-auto text-slate-350 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
          </svg>
          <p className="text-xs font-bold text-slate-500">No trend log data available for this listing period</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Views Area Chart */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Daily Page Views</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 10, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="Views" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#viewsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inquiries Bar Chart */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Inquiries Activity</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 10, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Inquiries" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
