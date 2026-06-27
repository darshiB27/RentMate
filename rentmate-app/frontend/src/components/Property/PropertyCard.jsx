// Property Card Component
// Purpose: Formats individual properties details with layouts for search listings catalogs.
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toggleWishlist, checkIsWishlisted } from '../../features/wishlist/services/wishlistApi.js';

export default function PropertyCard({ property }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Fetch wishlisted status for this card
  const { data: isWishlisted } = useQuery({
    queryKey: ['isWishlisted', property._id],
    queryFn: () =>
      checkIsWishlisted(property._id).then((res) => res.data?.data?.isWishlisted ?? false),
    enabled: !!user,
    initialData: false,
  });

  const wishlistMutation = useMutation({
    mutationFn: () => toggleWishlist(property._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isWishlisted', property._id] });
      queryClient.invalidateQueries({ queryKey: ['userWishlist'] });
      queryClient.invalidateQueries({ queryKey: ['tenantWishlistCount'] });
    },
  });

  const primaryImage = property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';

  const handleWishlistToggle = (e) => {
    e.preventDefault(); // Prevent navigating to detail page on clicking heart button
    if (!user) {
      navigate('/login');
      return;
    }
    wishlistMutation.mutate();
  };

  const getGenderColorClass = (gender) => {
    switch (gender) {
      case 'boys':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'girls':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-purple-50 text-purple-600 border-purple-100';
    }
  };

  return (
    <Link
      to={`/property/${property._id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative"
    >
      {/* Property Thumbnail Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Floating Gender and Category badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg border shadow-xs ${getGenderColorClass(property.genderCategory)}`}>
            {property.genderCategory} Only
          </span>
          {property.isFeatured && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg bg-amber-500 text-white shadow-xs">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white backdrop-blur-xs rounded-full shadow-xs border border-slate-200/50 text-slate-500 hover:text-rose-500 hover:scale-105 transition-all duration-150 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isWishlisted ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-4 h-4 ${isWishlisted ? 'text-rose-500' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>
      </div>

      {/* Property Details info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {property.type} &bull; {property.sharingType} sharing
            </span>
            <div className="flex items-center text-xs text-amber-500 font-semibold gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
              </svg>
              <span>{property.ratingAverage > 0 ? property.ratingAverage : 'New'}</span>
            </div>
          </div>

          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-indigo-600 transition-colors">
            {property.title}
          </h3>

          <p className="text-xs text-slate-500 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span className="truncate">{property.address?.locality}, {property.address?.city}</span>
          </p>
        </div>

        {/* Pricing Block */}
        <div className="flex items-center justify-between border-t border-slate-100/80 mt-4 pt-3 text-slate-700">
          <div className="flex items-baseline">
            <span className="text-base font-extrabold text-slate-800">₹{property.price.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 font-medium ml-1">/month</span>
          </div>
          <span className="text-xs font-semibold text-indigo-600 group-hover:underline flex items-center gap-0.5">
            Book Stay
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
