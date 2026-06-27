// Search Results Catalog Screen
// Purpose: Split-column search directory mapping properties filters with Leaflet coordinates markers.
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import FilterSidebar from '../components/Property/FilterSidebar.jsx';
import PropertyGrid from '../components/Property/PropertyGrid.jsx';
import SearchBar from '../components/Property/SearchBar.jsx';
import MapContainer from '../components/Map/MapContainer.jsx';
import { searchProperties } from '../features/properties/services/propertyApi.js';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  // Extract query filters from URL
  const city = searchParams.get('city') || 'Bangalore';
  const searchQuery = searchParams.get('searchQuery') || '';
  const propertyType = searchParams.get('propertyType') || undefined;
  const sharingType = searchParams.get('sharingType') || undefined;
  const gender = searchParams.get('gender') || undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sort = searchParams.get('sort') || 'price_asc';
  const amenities = searchParams.get('amenities') || undefined;
  const rating = searchParams.get('rating') || undefined;
  const ownerVerified = searchParams.get('ownerVerified') || undefined;
  const featured = searchParams.get('featured') || undefined;

  // React Query fetching results with abort signal cancellation support
  const queryParams = {
    city,
    searchQuery,
    propertyType,
    sharingType,
    gender,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 6,
    amenities,
    rating,
    ownerVerified,
    featured,
  };

  const { data: searchResponse, isLoading, refetch, isError } = useQuery({
    queryKey: ['searchPropertiesList', queryParams],
    queryFn: ({ signal }) => searchProperties(queryParams, { signal }).then((res) => res.data?.data || {}),
    keepPreviousData: true,
  });

  // Re-fetch on filter changes
  useEffect(() => {
    refetch();
  }, [
    city,
    searchQuery,
    propertyType,
    sharingType,
    gender,
    minPrice,
    maxPrice,
    sort,
    page,
    amenities,
    rating,
    ownerVerified,
    featured,
    refetch,
  ]);

  const properties = searchResponse?.properties || [];
  const pagination = searchResponse?.pagination || null;

  // Handle sidebar filter adjustments
  const handleFilterUpdate = (newFilters) => {
    const updatedParams = new URLSearchParams(searchParams);
    
    const setOrDelete = (key, val) => {
      if (val !== undefined && val !== null && val !== '') {
        updatedParams.set(key, val);
      } else {
        updatedParams.delete(key);
      }
    };

    setOrDelete('propertyType', newFilters.propertyType);
    setOrDelete('sharingType', newFilters.sharingType);
    setOrDelete('gender', newFilters.gender);
    setOrDelete('minPrice', newFilters.minPrice);
    setOrDelete('maxPrice', newFilters.maxPrice);
    setOrDelete('amenities', newFilters.amenities);
    setOrDelete('rating', newFilters.rating);
    setOrDelete('ownerVerified', newFilters.ownerVerified);
    setOrDelete('featured', newFilters.featured);
    
    setPage(1); // Reset page on filter change
    setSearchParams(updatedParams);
  };

  const handleSortUpdate = (newSort) => {
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set('sort', newSort);
    setSearchParams(updatedParams);
  };

  const handleRemoveChip = (chip) => {
    const updatedParams = new URLSearchParams(searchParams);
    if (chip.key === 'amenity') {
      const list = (amenities || '').split(',').filter((a) => a !== chip.value);
      if (list.length > 0) {
        updatedParams.set('amenities', list.join(','));
      } else {
        updatedParams.delete('amenities');
      }
    } else {
      updatedParams.delete(chip.key);
    }
    setPage(1);
    setSearchParams(updatedParams);
  };

  const currentFilters = {
    propertyType,
    sharingType,
    gender,
    minPrice,
    maxPrice,
    amenities,
    rating,
    ownerVerified,
    featured,
  };

  const getActiveChips = () => {
    const chips = [];
    if (propertyType) chips.push({ label: `Type: ${propertyType}`, key: 'propertyType' });
    if (sharingType) chips.push({ label: `Sharing: ${sharingType}`, key: 'sharingType' });
    if (gender) chips.push({ label: `Gender: ${gender}`, key: 'gender' });
    if (minPrice) chips.push({ label: `Min: ₹${minPrice}`, key: 'minPrice' });
    if (maxPrice) chips.push({ label: `Max: ₹${maxPrice}`, key: 'maxPrice' });
    if (amenities) {
      amenities.split(',').forEach((a) => {
        if (a) chips.push({ label: `Amenity: ${a}`, key: 'amenity', value: a });
      });
    }
    if (rating) chips.push({ label: `Rating: ${rating}+ ★`, key: 'rating' });
    if (ownerVerified === 'true') chips.push({ label: 'Verified Owner', key: 'ownerVerified' });
    if (featured === 'true') chips.push({ label: 'Featured', key: 'featured' });
    return chips;
  };

  const activeChips = getActiveChips();

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4">
      {/* Top Search Bar */}
      <div className="bg-slate-100/50 p-4 rounded-3xl border border-slate-200/30 flex justify-center">
        <SearchBar />
      </div>

      {/* Main split layout content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: Filters */}
        <div className="lg:w-1/4 flex-shrink-0">
          <FilterSidebar
            filters={currentFilters}
            onFilterChange={handleFilterUpdate}
            city={city}
          />
        </div>

        {/* Center column: Listings Grid */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-500 font-semibold">
                Showing <span className="text-slate-800 font-bold">{properties.length}</span> stays in {city}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Sort By:</span>
                <select
                  value={sort}
                  onChange={(e) => handleSortUpdate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Top Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_viewed">Most Viewed</option>
                  <option value="most_wishlisted">Most Wishlisted</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-1">Active Filters:</span>
                {activeChips.map((chip, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg shadow-2xs"
                  >
                    <span>{chip.label}</span>
                    <button
                      onClick={() => handleRemoveChip(chip)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 rounded cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isError ? (
            <div className="bg-rose-50/50 border border-rose-100 text-rose-600 rounded-2xl p-8 text-center max-w-md mx-auto">
              <h3 className="font-extrabold text-sm uppercase tracking-wider mb-2">Error Loading Properties</h3>
              <p className="text-xs text-rose-500 mb-4">We encountered a temporary database issues. Please retry the search.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
              >
                Retry Search
              </button>
            </div>
          ) : (
            <PropertyGrid
              properties={properties}
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>

        {/* Right column: Leaflet Map */}
        <div className="hidden xl:block xl:w-1/3 min-h-[400px] h-[calc(100vh-220px)] sticky top-[95px]">
          <MapContainer
            properties={properties}
            zoom={12}
          />
        </div>
      </div>
    </div>
  );
}

