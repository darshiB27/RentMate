// Schedule Visit Modal Component
// Purpose: Displays scheduled property visit details, dates, and owner notes in a popup.
import React from 'react';

export default function ScheduleVisitModal({ isOpen, onClose, visitDate, notes }) {
  if (!isOpen) return null;

  const formattedDate = visitDate
    ? new Date(visitDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not Scheduled';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Scheduled Visit Details
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Date & Time</span>
            <p className="text-sm font-bold text-slate-800">{formattedDate}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner Notes / Instructions</span>
            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {notes || 'No special notes or visit instructions provided by the owner yet.'}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
