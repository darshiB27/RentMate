// Detailed listing view page
// Purpose: Details specifications, amenities list, maps coordinates, and direct contacts form.
import React from 'react';
import { useParams } from 'react-router-dom';

export default function PropertyDetail() {
  const { id } = useParams();
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800">Property Details (Listing ID: {id})</h1>
      <p className="text-gray-500 mt-2">Detailed maps and inquiry layouts placeholder.</p>
    </div>
  );
}
