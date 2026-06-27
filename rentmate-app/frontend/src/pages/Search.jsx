// Maps Search & Filters page
// Purpose: Interfaces search panels with geospatial markers matching coordinates listings.
import React from 'react';
import FilterBar from '../features/properties/components/FilterBar.jsx';
import MapContainer from '../components/Map/MapContainer.jsx';

export default function Search() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <FilterBar />
        <div className="text-gray-500">Listings grid list placeholder.</div>
      </div>
      <div>
        <MapContainer />
      </div>
    </div>
  );
}
