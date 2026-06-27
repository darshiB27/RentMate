// Owner Dashboard Screen
// Purpose: Renders KPIs, received inquiries management list, listing summaries, and navigation quick actions.
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getOwnerAnalytics } from '../features/analytics/services/analyticsApi.js';
import { getMyInquiries, acceptInquiryRequest, rejectInquiryRequest, scheduleVisitRequest } from '../features/inquiries/services/inquiryApi.js';
import { getOwnerPropertiesRequest } from '../features/properties/services/propertyApi.js';
import InquiryStatusBadge from '../features/inquiries/components/InquiryStatusBadge.jsx';

export default function OwnerDashboard() {
  const queryClient = useQueryClient();

  // 1. Fetch Owner stats
  const { data: analyticsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['ownerAnalyticsStats'],
    queryFn: () => getOwnerAnalytics().then((res) => res.data?.data || {}),
  });

  // 2. Fetch Recent Inquiries (Received inquiries)
  const { data: inquiriesResponse, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['ownerReceivedInquiriesDashboard'],
    queryFn: () => getMyInquiries({ page: 1, limit: 3 }).then((res) => res.data?.data || {}),
  });

  // 3. Fetch Owner's Properties Summary
  const { data: propertiesResponse, isLoading: propertiesLoading } = useQuery({
    queryKey: ['ownerPropertiesDashboard'],
    queryFn: () => getOwnerPropertiesRequest({ page: 1, limit: 3 }).then((res) => res.data?.data || {}),
  });

  // Actions Mutations
  const acceptMutation = useMutation({
    mutationFn: ({ id, notes }) => acceptInquiryRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerReceivedInquiriesDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ownerAnalyticsStats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }) => rejectInquiryRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerReceivedInquiriesDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ownerAnalyticsStats'] });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ id, visitDate, notes }) => scheduleVisitRequest(id, visitDate, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerReceivedInquiriesDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['ownerAnalyticsStats'] });
    },
  });

  const handleAccept = (id) => {
    const feedback = prompt('Enter message notes for the tenant (optional):') || 'Inquiry accepted. Let us connect!';
    acceptMutation.mutate({ id, notes: feedback });
  };

  const handleReject = (id) => {
    const feedback = prompt('Enter rejection notes for the tenant (optional):') || 'Property is currently unavailable.';
    rejectMutation.mutate({ id, notes: feedback });
  };

  const handleScheduleVisit = (id) => {
    const dateStr = prompt('Enter visit date (YYYY-MM-DD):');
    if (!dateStr) return;
    const feedback = prompt('Enter instructions for the visit (optional):') || 'Please carry a valid ID card.';
    scheduleMutation.mutate({ id, visitDate: dateStr, notes: feedback });
  };

  const summary = analyticsResponse?.summary || { totalViews: 0, totalInquiries: 0, conversionRate: 0 };
  const inquiries = inquiriesResponse?.inquiries || [];
  const properties = propertiesResponse?.properties || [];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
            Owner Hub
          </h1>
          <p className="text-sm text-slate-400">Track page views, manage listings, and sync tenant inquiries progress.</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Views Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex items-start gap-4 hover:shadow-md transition-all duration-200">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listing Views</span>
            <p className="text-3xl font-black text-slate-850">{statsLoading ? '...' : summary.totalViews}</p>
          </div>
        </div>

        {/* Total Inquiries Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex items-start gap-4 hover:shadow-md transition-all duration-200">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquiries Received</span>
            <p className="text-3xl font-black text-slate-850">{statsLoading ? '...' : summary.totalInquiries}</p>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex items-start gap-4 hover:shadow-md transition-all duration-200">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion rate</span>
            <p className="text-3xl font-black text-slate-850">{statsLoading ? '...' : `${summary.conversionRate}%`}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Inquiries/Summary) & Right (Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Received Inquiries & Properties Summary */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Inquiries List */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Recent Inquiries Feed</h3>
              <Link to="/owner/inquiries" className="text-xs font-bold text-indigo-600 hover:text-indigo-850 transition-colors">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {inquiriesLoading ? (
                <div className="p-8 text-center text-xs text-slate-450 animate-pulse font-semibold">
                  Loading inquiries feed...
                </div>
              ) : inquiries.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H3.75A2.25 2.25 0 0 0 1.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25h12a2.25 2.25 0 0 0 2.25-2.25V14.25Z" />
                  </svg>
                  <p className="text-xs font-bold text-slate-500">No inquiries received yet</p>
                </div>
              ) : (
                inquiries.map((inquiry) => {
                  const property = inquiry.propertyId || {};
                  const tenant = inquiry.tenantId || {};

                  return (
                    <div key={inquiry._id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/20 transition-colors">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{property.title || 'Unknown Stay'}</h4>
                          <InquiryStatusBadge status={inquiry.status} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          From: <span className="font-semibold text-slate-650">{tenant.name || 'Tenant'}</span> ({tenant.email})
                        </p>
                        <p className="text-xs text-slate-450 bg-slate-50 p-2 rounded-lg italic">
                          &ldquo;{inquiry.message}&rdquo;
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          to={`/chat?inquiryId=${inquiry._id}`}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
                          </svg>
                          Chat
                        </Link>
                        {inquiry.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(inquiry._id)}
                              disabled={acceptMutation.isPending}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(inquiry._id)}
                              disabled={rejectMutation.isPending}
                              className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Property Summary Section */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Properties Directory</h3>
              <Link to="/owner/properties" className="text-xs font-bold text-indigo-600 hover:text-indigo-850 transition-colors">
                Manage Listings
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {propertiesLoading ? (
                <div className="p-8 text-center text-xs text-slate-450 animate-pulse font-semibold">
                  Loading properties summary...
                </div>
              ) : properties.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75" />
                  </svg>
                  <p className="text-xs font-bold text-slate-500">No property listings submitted yet</p>
                </div>
              ) : (
                properties.map((prop) => (
                  <div key={prop._id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/20 transition-all duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-150 shrink-0">
                        <img
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=120&q=80'}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{prop.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] uppercase font-bold text-slate-450 bg-slate-50 px-1.5 py-0.5 rounded-md">
                            {prop.type}
                          </span>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                            prop.verificationStatus === 'approved'
                              ? 'bg-emerald-50 text-emerald-600'
                              : prop.verificationStatus === 'rejected'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}>
                            {prop.verificationStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-800">₹{prop.price.toLocaleString('en-IN')}</p>
                      <p className="text-[9px] text-slate-450 mt-0.5 font-bold uppercase tracking-wider">{prop.availabilityStatus}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100">
              Quick Actions
            </h3>

            <div className="flex flex-col gap-3">
              <Link
                to="/owner/properties/add"
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-extrabold shadow-xs hover:shadow-md text-center transition-all cursor-pointer"
              >
                Add New Property
              </Link>
              <Link
                to="/owner/properties"
                className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
              >
                Manage My Properties
              </Link>
              <Link
                to="/owner/analytics"
                className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
              >
                View Detailed Analytics
              </Link>
              <Link
                to="/chat"
                className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
              >
                Open Inbox Chats
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-950 text-white rounded-2xl p-6 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Need Help Listing?</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Make sure to list coordinates accurately for maps lookup. Upload up to 10 high-quality images to increase tenant inquiries by 3x.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
