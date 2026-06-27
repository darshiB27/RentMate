// Content Wrapper Card
// Purpose: Encapsulates page grids in rounded panels, subtle borders, and clean spacing.
import React from 'react';
export default function Card({ children, className = '' }) {
  return <div className={"bg-white border border-gray-100 rounded-xl p-5 shadow-sm " + className}>{children}</div>;
}
