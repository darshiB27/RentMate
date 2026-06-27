// Wishlist Page Screen
// Purpose: Displays the user's wishlisted properties in a grid, with removal actions and empty state.
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserWishlist, toggleWishlist } from '../features/wishlist/services/wishlistApi.js';
import PropertyCard from '../components/Property/PropertyCard.jsx';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 6;

  // Fetch wishlisted items
  const { data: wishlistResponse, isLoading } = useQuery({
    queryKey: ['userWishlist', page],
    queryFn: () => getUserWishlist({ page, limit }).then((res) => res.data?.data || {}),
  });

  // Toggle wishlist mutation
  const toggleMutation = useMutation({
    mutationFn: (propertyId) => toggleWishlist(propertyId),
    onSuccess: () => {
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['userWishlist'] });
    },
  });

  const wishlistItems = wishlistResponse?.wishlist || [];
  const pagination = wishlistResponse?.pagination || null;

  const handleRemove = (propertyId) => {
    toggleMutation.mutate(propertyId);
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5 space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Saved stays</h1>
        <p className="text-sm text-slate-400">Keep track of your favorite rooms, PGs, and hostels</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-pulse h-80" />
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <h3 className="font-extrabold text-slate-800 text-lg">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
            Start exploring rooms and click the heart icon on any stay card to save it here.
          </p>
          <Link
            to="/search"
            className="block text-center mt-6 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const property = item.property;
              if (!property) return null;
              
              // We pass property to PropertyCard directly. To allow removing, we can wrap or handle it.
              // Reusing PropertyCard here is extremely clean.
              return (
                <div key={item._id} className="relative group">
                  <PropertyCard property={property} />
                  
                  {/* Overlay delete shortcut on Wishlist Page for easy removal */}
                  <button
                    onClick={() => handleRemove(property._id)}
                    className="absolute top-3 right-3 p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md z-20 transition-all duration-150 cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Paginated indicators */}
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

// Inline helper Link import
import { Link } from 'react-router-dom';
