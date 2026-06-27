// Standard Form Input Element
// Purpose: Enforces consistent borders, focus indicators, error margins, and layouts.
import React from 'react';
export default function Input(props) {
  return <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" {...props} />;
}
