// Property Grid Layout Component
// Purpose: Multi-column listing renderer supporting pagination handles and skeleton pre-renderers.
import React from 'react';
import PropertyCard from './PropertyCard.jsx';

export default function PropertyGrid({
  properties = [],
  isLoading = false,
  pagination = null,
  onPageChange = () => {},
}) {
  // Skeleton count helper
  const skeletonCards = Array.from({ length: 6 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {skeletonCards.map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-pulse"
            >
              <div className="bg-slate-200 aspect-video w-full" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-1/3 bg-slate-200 rounded-md" />
                <div className="h-4 w-4/5 bg-slate-200 rounded-md" />
                <div className="h-3 w-1/2 bg-slate-200 rounded-md" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 w-1/4 bg-slate-200 rounded-md" />
                  <div className="h-4 w-1/5 bg-slate-200 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 max-w-lg mx-auto shadow-xs">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
        <h3 className="font-extrabold text-slate-800 text-lg">No Accommodations Found</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          We couldn&apos;t find matching properties. Try adjusting your filter sliders, expanding the radius, or trying a different keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Properties Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-xs flex items-center gap-1 transition-colors duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Prev
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => onPageChange(pNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  pagination.page === pNum
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-xs flex items-center gap-1 transition-colors duration-150 cursor-pointer"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
