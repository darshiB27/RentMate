import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMyInquiries } from '../features/inquiries/services/inquiryApi.js';
import { getUserWishlist } from '../features/wishlist/services/wishlistApi.js';
import { getUnreadCount } from '../features/notifications/services/notificationApi.js';
import InquiryStatusBadge from '../features/inquiries/components/InquiryStatusBadge.jsx';

export default function TenantDashboard() {
  const { user } = useSelector((state) => state.auth);

  // Fetch recent inquiries
  const { data: inquiriesResponse, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['tenantRecentInquiries'],
    queryFn: () => getMyInquiries({ page: 1, limit: 3 }).then((res) => res.data?.data || {}),
  });

  // Fetch wishlist total count
  const { data: wishlistCount, isLoading: wishlistLoading } = useQuery({
    queryKey: ['tenantWishlistCount'],
    queryFn: () => getUserWishlist({ page: 1, limit: 1 }).then((res) => res.data?.data?.pagination?.total || 0),
  });

  // Fetch unread notifications count
  const { data: notificationsCount, isLoading: notificationsLoading } = useQuery({
    queryKey: ['tenantUnreadNotificationsCount'],
    queryFn: () => getUnreadCount().then((res) => res.data?.data?.count || 0),
  });

  const inquiries = inquiriesResponse?.inquiries || [];
  const inquiriesTotal = inquiriesResponse?.pagination?.total || 0;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="border-b border-slate-100 pb-5 space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
          Welcome back, {user?.name || 'Tenant'}!
        </h1>
        <p className="text-sm text-slate-400">Manage your saved properties, check active visit schedules, and view alerts.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wishlist Card */}
        <Link
          to="/tenant/wishlist"
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-4 group"
        >
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved stays</span>
            <p className="text-3xl font-black text-slate-800">{wishlistLoading ? '...' : wishlistCount}</p>
          </div>
        </Link>

        {/* Inquiries Card */}
        <Link
          to="/tenant/inquiries"
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-4 group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Inquiries</span>
            <p className="text-3xl font-black text-slate-800">{inquiriesLoading ? '...' : inquiriesTotal}</p>
          </div>
        </Link>

        {/* Notifications Card */}
        <Link
          to="/tenant/notifications"
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-4 group"
        >
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unread Alerts</span>
            <p className="text-3xl font-black text-slate-800">{notificationsLoading ? '...' : notificationsCount}</p>
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Inquiries & Quick Action Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries Section */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Recent Inquiries</h3>
            {inquiriesTotal > 3 && (
              <Link to="/tenant/inquiries" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                View All Inquiries
              </Link>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {inquiriesLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse font-semibold">
                Loading inquiries history...
              </div>
            ) : inquiries.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 010 5.25H12M8.25 9.75L10.5 7.5M8.25 9.75L10.5 12m9-7.5v15m-16.5 0h16.5" />
                </svg>
                <p className="text-xs font-semibold text-slate-500">No active inquiries</p>
                <p className="text-[10px] text-slate-400 mt-1">Start exploring properties and messaging owners today!</p>
                <Link
                  to="/search"
                  className="inline-block mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold shadow-xs transition-colors"
                >
                  Explore Stays
                </Link>
              </div>
            ) : (
              inquiries.map((inquiry) => {
                const property = inquiry.propertyId || {};
                const visit = inquiry.visitSchedule || null;

                return (
                  <div key={inquiry._id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-all duration-150">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{property.title || 'Unknown Stay'}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate">
                        Owner: <span className="font-semibold text-slate-500">{inquiry.ownerId?.name || 'N/A'}</span>
                      </p>
                      {visit && visit.date && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100/50 text-[9px] font-bold text-indigo-700 px-2 py-0.5 rounded-md">
                          <span>Visit scheduled:</span>
                          <span>{new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      <InquiryStatusBadge status={inquiry.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tenant Guideline Cards */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide border-b border-slate-50 pb-3">Tenant Guide</h3>
          
          <div className="space-y-4 text-xs font-semibold text-slate-600 leading-relaxed">
            <div className="flex gap-3">
              <span className="h-5 w-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">1</span>
              <p>Explore rooms, PGs, and hostels using search queries.</p>
            </div>
            <div className="flex gap-3">
              <span className="h-5 w-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">2</span>
              <p>Save stay cards to your wishlist, or click 'Contact Owner' directly.</p>
            </div>
            <div className="flex gap-3">
              <span className="h-5 w-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">3</span>
              <p>Monitor your dashboard for alerts, read messages, and scheduled physical visits.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
