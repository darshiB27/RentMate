// Inquiry Status Badge Component
// Purpose: Renders color-coded status badges for inquiries.
import React from 'react';

export default function InquiryStatusBadge({ status }) {
  const getBadgeStyles = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'viewed':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'contacted':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'accepted':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'completed':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'cancelled':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg border shadow-xs ${getBadgeStyles(status)}`}>
      {status}
    </span>
  );
}
