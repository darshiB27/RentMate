// My Inquiries Screen
// Purpose: Lists paginated inquiries log history submitted by the tenant.
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyInquiries, cancelInquiry } from '../features/inquiries/services/inquiryApi.js';
import InquiryCard from '../features/inquiries/components/InquiryCard.jsx';
import { Link } from 'react-router-dom';

export default function MyInquiries() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 5; // 5 inquiries per page

  // Query my inquiries list
  const { data: inquiriesResponse, isLoading } = useQuery({
    queryKey: ['userInquiries', page],
    queryFn: () => getMyInquiries({ page, limit }).then((res) => res.data?.data || {}),
  });

  // Cancel inquiry mutation
  const cancelMutation = useMutation({
    mutationFn: (id) => cancelInquiry(id, 'Cancelled by tenant'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInquiries'] });
    },
  });

  const inquiries = inquiriesResponse?.inquiries || [];
  const pagination = inquiriesResponse?.pagination || null;

  const handleCancel = (id) => {
    cancelMutation.mutate(id);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5 space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Inquiries</h1>
        <p className="text-sm text-slate-400">Track stays messages history, schedule visits, and view owner contacts</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-pulse h-40" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.751Z" />
            </svg>
          </div>
          <h3 className="font-extrabold text-slate-800 text-lg">No Inquiries Found</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
            You haven&apos;t inquired about any properties yet. Find a room you like and send a message to the owner.
          </p>
          <Link
            to="/search"
            className="block text-center mt-6 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Start Search
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry._id}
                inquiry={inquiry}
                onCancel={handleCancel}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-slate-100">
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
      )}
    </div>
  );
}
