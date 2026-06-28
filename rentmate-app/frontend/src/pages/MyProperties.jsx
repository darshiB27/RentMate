// My Properties Management Page
// Purpose: Lists all properties uploaded by the owner, allows soft-deleting, availability toggling, and search.
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getOwnerPropertiesRequest, deletePropertyRequest, updateAvailabilityRequest } from '../features/properties/services/propertyApi.js';

export default function MyProperties() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 6; // 6 properties per page

  // Query properties
  const { data: propertiesResponse, isLoading, isError, error } = useQuery({
    queryKey: ['ownerProperties', page, search],
    queryFn: () =>
      getOwnerPropertiesRequest({
        page,
        limit,
        search,
      }).then((res) => res.data?.data || {}),
    keepPreviousData: true,
  });

  const properties = propertiesResponse?.properties || [];
  const pagination = propertiesResponse?.pagination || null;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deletePropertyRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerAnalyticsStats'] });
      queryClient.invalidateQueries({ queryKey: ['ownerPropertiesDashboard'] });
    },
  });

  // Toggle availability status mutation
  const availabilityMutation = useMutation({
    mutationFn: ({ id, status }) => updateAvailabilityRequest(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['ownerPropertiesDashboard'] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this listing? It will remove it from search list logs.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAvailabilityChange = (id, newStatus) => {
    availabilityMutation.mutate({ id, status: newStatus });
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Listings</h1>
          <p className="text-sm text-slate-400">View and update stay details, toggle occupancies, and check approval states.</p>
        </div>
        <Link
          to="/owner/properties/add"
          className="self-start sm:self-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          Add New Listing
        </Link>
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 transition-all"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
          </svg>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-2xl text-center max-w-md mx-auto text-xs font-semibold">
          {error?.response?.data?.message || error?.message || 'Failed to retrieve stay listings.'}
        </div>
      )}

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-pulse h-80" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 max-w-md mx-auto shadow-xs">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75" />
          </svg>
          <h3 className="font-extrabold text-slate-800 text-lg">No Listings Found</h3>
          <p className="text-xs text-slate-400 mt-2">Get started by creating your first rental property listing!</p>
          <Link
            to="/owner/properties/add"
            className="inline-block mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
          >
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div
              key={prop._id}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              {/* Image thumbnail and stats header */}
              <div className="relative aspect-video bg-slate-100">
                <img
                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-lg border shadow-xs ${
                    prop.verificationStatus === 'approved'
                      ? 'bg-emerald-550 text-white border-emerald-500'
                      : prop.verificationStatus === 'rejected'
                      ? 'bg-rose-550 text-white border-rose-500'
                      : 'bg-amber-500 text-white border-amber-400'
                  }`}>
                    {prop.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold text-indigo-650 tracking-wider">
                    {prop.type} &bull; {prop.sharingType} sharing &bull; {prop.genderCategory}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2">
                    {prop.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {prop.address?.locality}, {prop.address?.city}
                  </p>
                  <p className="text-xs font-black text-slate-800 mt-1">₹{prop.price.toLocaleString('en-IN')}/mo</p>
                </div>

                {/* Controls block */}
                <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between gap-4">
                  {/* Availability Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Availability</label>
                    <select
                      value={prop.availabilityStatus}
                      onChange={(e) => handleAvailabilityChange(prop._id, e.target.value)}
                      disabled={availabilityMutation.isPending}
                      className="px-2 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 self-end">
                    <Link
                      to={`/owner/analytics?propertyId=${prop._id}`}
                      className="p-2 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="View Performance Analytics"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </Link>
                    <Link
                      to={`/owner/properties/edit/${prop._id}`}
                      className="p-2 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Stay listing"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(prop._id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Stay listing"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination row */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-100">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-xs transition-colors cursor-pointer"
          >
            Prev
          </button>
          <span className="text-xs text-slate-500 font-semibold">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
            disabled={page >= pagination.pages}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-xs transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
