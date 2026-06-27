// Custom Wrapper Field Component
// Purpose: Attaches field labels, form controls, and hook-form errors dynamically.
import React from 'react';
export default function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col space-y-1 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
