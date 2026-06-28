// Property List Directory Page
// Purpose: Displays paginated grid of all approved, active listings in RentMate.
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PropertyGrid from '../components/Property/PropertyGrid.jsx';
import { getProperties } from '../features/properties/services/propertyApi.js';

export default function PropertyList() {
  const [page, setPage] = useState(1);
  const limit = 9; // Display 9 items per page

  const { data: propertiesResponse, isLoading } = useQuery({
    queryKey: ['propertiesList', page],
    queryFn: () => getProperties({ page, limit }).then((res) => res.data?.data || {}),
  });

  const properties = propertiesResponse?.properties || [];
  const pagination = propertiesResponse?.pagination || null;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="space-y-1 border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Explore Accommodations</h1>
        <p className="text-sm text-slate-400">Discover all verified PG, Hostels, and Flat stays across prime regions</p>
      </div>

      {/* Grid listing */}
      <PropertyGrid
        properties={properties}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
