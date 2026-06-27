// Filter Sidebar Component
// Purpose: Offers sidebar criteria configurations matching rental properties specifications.
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFilterCounts } from '../../features/properties/services/propertyApi.js';

export default function FilterSidebar({ filters, onFilterChange, city }) {
  // Query dynamic count statistics and price boundaries from backend search service
  const { data: countDataResponse, isLoading } = useQuery({
    queryKey: ['filterCounts', city],
    queryFn: () => getFilterCounts({ city }).then((res) => res.data?.data || {}),
    staleTime: 60000, // cache for 1 minute
  });

  const countData = countDataResponse || {
    minPrice: 0,
    maxPrice: 50000,
    gender: {},
    type: {},
    sharing: {},
  };

  const handlePriceChange = (field, val) => {
    onFilterChange({
      ...filters,
      [field]: val === '' ? undefined : Number(val),
    });
  };

  const handleSelectToggle = (field, val) => {
    // If clicking already selected item, toggle it off
    onFilterChange({
      ...filters,
      [field]: filters[field] === val ? undefined : val,
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
      minPrice: undefined,
      maxPrice: undefined,
      gender: undefined,
      sharingType: undefined,
      propertyType: undefined,
      amenities: undefined,
      availability: undefined,
      verificationStatus: undefined,
      featured: undefined,
      rating: undefined,
      ownerVerified: undefined,
    });
  };

  return (
    <aside className="bg-white p-6 border border-slate-100 rounded-2xl shadow-xs space-y-6 flex flex-col justify-between max-w-xs w-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
            </svg>
            Filters
          </h3>
          <button
            onClick={handleResetFilters}
            className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Price Slider range fields */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Rent (₹)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">MIN PRICE</label>
              <input
                type="number"
                value={filters.minPrice !== undefined ? filters.minPrice : ''}
                placeholder={countData.minPrice || '0'}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">MAX PRICE</label>
              <input
                type="number"
                value={filters.maxPrice !== undefined ? filters.maxPrice : ''}
                placeholder={countData.maxPrice || '50,000'}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Gender Category */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tenant Gender</h4>
          <div className="flex flex-col gap-2">
            {['boys', 'girls', 'unisex'].map((g) => {
              const isActive = filters.gender === g;
              const count = countData.gender[g] || 0;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSelectToggle('gender', g)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                      : 'border-slate-200 text-slate-600 bg-slate-50/30 hover:bg-slate-50'
                  }`}
                >
                  <span className="capitalize">{g}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Type</h4>
          <div className="flex flex-col gap-2">
            {['PG', 'Hostel', 'Flat'].map((t) => {
              const isActive = filters.propertyType === t;
              const count = countData.type[t] || 0;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleSelectToggle('propertyType', t)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                      : 'border-slate-200 text-slate-600 bg-slate-50/30 hover:bg-slate-50'
                  }`}
                >
                  <span>{t}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sharing Configuration */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sharing Type</h4>
          <div className="flex flex-col gap-2">
            {['single', 'double', 'triple', 'quad', 'other'].map((s) => {
              const isActive = filters.sharingType === s;
              const count = countData.sharing[s] || 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSelectToggle('sharingType', s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                      : 'border-slate-200 text-slate-600 bg-slate-50/30 hover:bg-slate-50'
                  }`}
                >
                  <span className="capitalize">{s}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amenities Selection */}
        <div className="space-y-3 pt-4 border-t border-slate-100/60">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Amenities</h4>
          <div className="grid grid-cols-2 gap-2">
            {['WiFi', 'AC', 'Gym', 'Laundry', 'Parking', 'Power Backup', 'Food'].map((amenity) => {
              const currentAmenities = filters.amenities
                ? (Array.isArray(filters.amenities)
                  ? filters.amenities
                  : filters.amenities.split(','))
                : [];
              const isChecked = currentAmenities.includes(amenity);
              return (
                <label key={amenity} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const updated = isChecked
                        ? currentAmenities.filter((a) => a !== amenity)
                        : [...currentAmenities, amenity];
                      onFilterChange({
                        ...filters,
                        amenities: updated.length > 0 ? updated.join(',') : undefined,
                      });
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="space-y-3 pt-4 border-t border-slate-100/60">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Minimum Rating</h4>
          <div className="flex gap-2">
            {[
              { label: 'Any', value: undefined },
              { label: '3+ ★', value: 3 },
              { label: '4+ ★', value: 4 },
            ].map((opt) => {
              const isActive = filters.rating === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, rating: opt.value })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles: Featured & Owner Verified */}
        <div className="space-y-3 pt-4 border-t border-slate-100/60">
          <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer select-none">
            <span>Verified Owner Only</span>
            <input
              type="checkbox"
              checked={filters.ownerVerified === 'true' || filters.ownerVerified === true}
              onChange={(e) => {
                onFilterChange({
                  ...filters,
                  ownerVerified: e.target.checked ? 'true' : undefined,
                });
              }}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
            />
          </label>
          
          <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer select-none">
            <span>Featured Listings Only</span>
            <input
              type="checkbox"
              checked={filters.featured === 'true' || filters.featured === true}
              onChange={(e) => {
                onFilterChange({
                  ...filters,
                  featured: e.target.checked ? 'true' : undefined,
                });
              }}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
            />
          </label>
        </div>
      </div>
    </aside>
  );
}
