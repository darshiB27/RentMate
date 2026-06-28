import React from 'react';
import { timeAgo } from '../../../utils/formatters.js';

const TYPE_CONFIG = {
  inquiry: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    borderColor: 'border-l-indigo-500',
  },
  property: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    borderColor: 'border-l-emerald-500',
  },
  review: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.17 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.773-.564-.373-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
    borderColor: 'border-l-amber-500',
  },
  verification: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    borderColor: 'border-l-cyan-500',
  },
  system: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-slate-50 text-slate-600 border-slate-100',
    borderColor: 'border-l-slate-400',
  },
};

export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const { _id, title, message, type, isRead, createdAt } = notification;
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.system;

  return (
    <div
      className={`group relative flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-150 shadow-xs hover:shadow-md transition-all duration-200 border-l-4 ${config.borderColor} ${
        !isRead ? 'bg-indigo-50/15 border-slate-200' : 'opacity-85'
      }`}
    >
      {/* Icon Badge */}
      <div className={`p-2 rounded-lg border ${config.bgColor} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        {config.icon}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={`text-sm font-bold text-slate-800 leading-snug ${!isRead ? 'font-extrabold' : ''}`}>
            {title}
          </h4>
          {!isRead && (
            <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" title="Unread" />
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed break-words">{message}</p>
        <span className="text-[10px] text-slate-400 font-semibold mt-2 block">{timeAgo(createdAt)}</span>
      </div>

      {/* Actions container */}
      <div className="absolute right-4 top-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {!isRead && onMarkRead && (
          <button
            onClick={() => onMarkRead(_id)}
            className="p-1.5 bg-white text-indigo-600 border border-slate-200 rounded-lg shadow-xs hover:bg-indigo-50 transition-colors cursor-pointer"
            title="Mark as read"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(_id)}
            className="p-1.5 bg-white text-slate-400 border border-slate-200 rounded-lg shadow-xs hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete notification"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
