// Inquiry Card Component
// Purpose: Displays stay listing details, inquiry message text, status badge, and visit scheduler.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InquiryStatusBadge from './InquiryStatusBadge.jsx';
import ScheduleVisitModal from './ScheduleVisitModal.jsx';

export default function InquiryCard({ inquiry, onCancel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const property = inquiry.propertyId;
  const owner = inquiry.ownerId;
  
  if (!property) return null;

  const primaryImage = property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';

  const isCancelable = !['cancelled', 'rejected', 'completed'].includes(inquiry.status);
  const isVisitScheduled = inquiry.status === 'visit_scheduled' || (inquiry.visitDetails && inquiry.visitDetails.visitDate);

  const handleCancelClick = () => {
    if (window.confirm('Are you sure you want to cancel this inquiry?')) {
      onCancel(inquiry._id);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row">
      {/* Property image thumbnail */}
      <div className="md:w-48 relative overflow-hidden bg-slate-100 flex-shrink-0 aspect-video md:aspect-auto">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 pointer-events-none md:hidden">
          <InquiryStatusBadge status={inquiry.status} />
        </div>
      </div>

      {/* Inquiry details content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Inquiry #{inquiry._id?.slice(-6)}
              </span>
              <h3 className="font-extrabold text-slate-800 text-sm hover:text-indigo-600 line-clamp-1">
                <Link to={`/property/${property._id}`}>{property.title}</Link>
              </h3>
              <p className="text-xs text-slate-400">
                {property.address?.locality}, {property.address?.city} &bull; ₹{property.price.toLocaleString('en-IN')}/mo
              </p>
            </div>
            
            <div className="hidden md:block">
              <InquiryStatusBadge status={inquiry.status} />
            </div>
          </div>

          {/* User message block */}
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Your Message</span>
            <p className="text-xs text-slate-600 italic line-clamp-2 mt-0.5 font-medium">
              &ldquo;{inquiry.message}&rdquo;
            </p>
          </div>

          {/* Visit / Scheduling Info */}
          {isVisitScheduled && (
            <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100/50 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700">
              <div className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5 21 11.25v7.5" />
                </svg>
                <span>Visit Scheduled</span>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] font-extrabold uppercase bg-white border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50 transition-colors duration-150 cursor-pointer"
              >
                View Visit Details
              </button>
            </div>
          )}
        </div>

        {/* Footer controls & Owner Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 pt-3 gap-3">
          <div className="text-[10px] text-slate-400 font-semibold space-y-0.5">
            <p>Submitted: {new Date(inquiry.createdAt).toLocaleDateString()}</p>
            {owner && (
              <p className="text-slate-500">
                Owner: <span className="font-bold">{owner.name}</span> &bull; {owner.phoneNumber || owner.email}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <Link
              to={`/chat?inquiryId=${inquiry._id}`}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors duration-150 flex items-center gap-1 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
              </svg>
              Chat with Owner
            </Link>

            {isCancelable && (
              <button
                onClick={handleCancelClick}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors duration-150 flex items-center gap-1 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Cancel Inquiry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visited Details Modal */}
      {inquiry.visitDetails && (
        <ScheduleVisitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          visitDate={inquiry.visitDetails.visitDate}
          notes={inquiry.visitDetails.notes}
        />
      )}
    </div>
  );
}
