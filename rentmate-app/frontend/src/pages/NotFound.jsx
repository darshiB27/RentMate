// Route 404 handler page
// Purpose: Renders standard Page Not Found notifications and links users home.
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
      <h2 className="text-2xl font-bold text-gray-800">Page Not Found</h2>
      <p className="text-gray-500">The destination path does not exist.</p>
      <Link to="/" className="text-indigo-600 hover:underline">Back Home</Link>
    </div>
  );
}
