import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperties, approveProperty, rejectProperty, softDeleteProperty } from '../features/admin/services/adminApi.js';

export default function ManageProperties() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(''); // 'pending', 'approved', 'rejected', or ''
  const limit = 10;

  // Query properties
  const { data: propertiesResponse, isLoading, isError, error } = useQuery({
    queryKey: ['adminProperties', page, search, status],
    queryFn: () =>
      getProperties({
        page,
        limit,
        search,
        verificationStatus: status,
      }).then((res) => res.data?.data || {}),
  });

  const properties = propertiesResponse?.properties || [];
  const pagination = propertiesResponse?.pagination || null;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id) => approveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectProperty(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => softDeleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProperties'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const handleApprove = (id) => {
    if (confirm('Approve this property listing? It will become publicly visible.')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id) => {
    const reason = prompt('Please enter the reason for rejection (optional):') || 'Listing information is incomplete or inaccurate';
    rejectMutation.mutate({ id, reason });
  };

  const handleDelete = (id) => {
    if (confirm('WARNING: Are you sure you want to delete this listing? It will be removed from search directories.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
          Stay Listings
        </h1>
        <p className="text-sm text-slate-400">Review property uploads, approve verified rooms, manage listings, and inspect owners.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 min-w-[280px] gap-3">
          <input
            type="text"
            placeholder="Search listings by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 transition-all"
          />
        </div>

        <div>
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
          >
            <option value="">All Review Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Error View */}
      {isError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-2xl text-center max-w-md mx-auto text-xs font-semibold">
          {error?.response?.data?.message || error?.message || 'Failed to load property listings.'}
        </div>
      )}

      {/* Listings Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="px-6 py-4">Property details</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Review Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-100 rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    No properties listings found in the system.
                  </td>
                </tr>
              ) : (
                properties.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-50/30 transition-colors">
                    {/* Details */}
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-800 leading-snug">{prop.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide">
                        {prop.type} • {prop.sharingType} sharing • {prop.genderCategory}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{prop.ownerId?.name || 'Deleted User'}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{prop.ownerId?.email || 'N/A'}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          prop.verificationStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : prop.verificationStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {prop.verificationStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Approval triggers */}
                        {prop.verificationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(prop._id)}
                              disabled={approveMutation.isPending}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[10px] shadow-xs transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(prop._id)}
                              disabled={rejectMutation.isPending}
                              className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold text-[10px] shadow-xs transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Soft Delete listing shortcut */}
                        <button
                          onClick={() => handleDelete(prop._id)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 bg-slate-50/30 border-t border-slate-100">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-[10px] transition-colors cursor-pointer"
            >
              Prev
            </button>
            <span className="text-[10px] text-slate-500 font-bold">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
              disabled={page >= pagination.pages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-[10px] transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
