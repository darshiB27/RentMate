// Property Details Screen
// Purpose: Displays listing images, tags, coordinates mapping, description, and messaging forms.
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPropertyById } from '../features/properties/services/propertyApi.js';
import MapContainer from '../components/Map/MapContainer.jsx';
import ContactOwnerForm from '../features/inquiries/components/ContactOwnerForm.jsx';

export default function PropertyDetails() {
  const { id } = useParams();

  // Query property details from backend
  const { data: propertyResponse, isLoading, error } = useQuery({
    queryKey: ['propertyDetail', id],
    queryFn: () => getPropertyById(id).then((res) => res.data?.data || {}),
  });

  const property = propertyResponse;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-lg mx-auto bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 shadow-xs my-12">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-rose-500 mx-auto mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <h3 className="font-extrabold text-slate-800 text-lg">Error Loading Listing</h3>
        <p className="text-xs text-slate-400 mt-2">
          We encountered an error loading this property, or the listing has been removed.
        </p>
        <Link to="/search" className="block text-center mt-6 py-2 px-4 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return to Search
        </Link>
      </div>
    );
  }

  const images = property.images || [];
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
  const hasCoords = property.location?.coordinates && property.location.coordinates.length === 2;
  const lat = hasCoords ? property.location.coordinates[1] : 12.9716;
  const lng = hasCoords ? property.location.coordinates[0] : 77.5946;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link to="/search" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Listings
        </Link>
      </div>

      {/* Gallery Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden shadow-xs bg-slate-100">
        <div className="md:col-span-2 aspect-video overflow-hidden">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <div className="hidden md:flex flex-col gap-4 aspect-video">
          <div className="flex-1 overflow-hidden">
            <img
              src={images[1] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'}
              alt={property.title}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <img
              src={images[2] || 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80'}
              alt={property.title}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Details columns */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Information */}
        <div className="flex-1 space-y-8">
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                {property.type}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                {property.sharingType} Sharing
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600">
                {property.genderCategory} Only
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {property.title}
            </h1>
            
            <p className="text-sm text-slate-400 flex items-center gap-1 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {property.address?.street}, {property.address?.locality}, {property.address?.city}, {property.address?.zipCode}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-800 text-lg">About This Place</h3>
            <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">What This Stay Offers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {property.amenities?.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <div className="p-1 rounded-full bg-emerald-50 text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Map Location */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">Location Map</h3>
            <div className="h-80 w-full overflow-hidden rounded-2xl border border-slate-100 shadow-xs">
              {hasCoords ? (
                <MapContainer
                  properties={[property]}
                  center={[lat, lng]}
                  zoom={15}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                  Map coordinates not available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky form */}
        <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-[95px] h-fit">
          <div className="space-y-6">
            {/* Rent Pricing Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Rental Fee</span>
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold">₹{property.price?.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-400 ml-1">/month</span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 leading-relaxed">
                Deposit rules depend on agreement (usually 2 months rent). Direct transfer to Owner.
              </p>
            </div>

            {/* Inquiry form */}
            <ContactOwnerForm propertyId={property._id} />
          </div>
        </div>
      </div>
    </div>
  );
}
