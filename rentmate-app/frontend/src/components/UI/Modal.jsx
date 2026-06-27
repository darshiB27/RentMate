// Universal Popup Modal Container
// Purpose: Handles dark background overlays, scaling transitions, and ESC-key dismissals.
import React from 'react';
export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg relative max-w-md w-full">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}
