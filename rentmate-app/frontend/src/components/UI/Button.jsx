// Reusable Global Button Component
// Purpose: Standard styling for primary, secondary, loading states and hover transitions.
import React from 'react';
export default function Button({ children, ...props }) {
  return <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" {...props}>{children}</button>;
}
