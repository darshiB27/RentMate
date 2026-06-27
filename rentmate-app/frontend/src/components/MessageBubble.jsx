// Message Bubble Component
// Purpose: Styles individual conversation bubbles with sender layout alignment and read states.
import React from 'react';

export default function MessageBubble({ message, isOutgoing, senderName }) {
  const timeStr = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const initials = senderName ? senderName.slice(0, 2).toUpperCase() : '?';

  return (
    <div className={`flex gap-3 max-w-lg ${isOutgoing ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      {/* Sender Avatar */}
      {!isOutgoing && (
        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 self-end">
          {initials}
        </div>
      )}

      {/* Bubble Box */}
      <div className="flex flex-col space-y-1">
        <div
          className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium shadow-xs ${
            isOutgoing
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-slate-100 text-slate-800 rounded-tl-none'
          }`}
        >
          {message.text}
        </div>

        {/* Info label (Time + Read check) */}
        <div className={`flex items-center gap-1.5 text-[9px] text-slate-400 font-medium ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
          <span>{timeStr}</span>
          {isOutgoing && (
            <svg
              className={`w-3.5 h-3.5 ${message.isRead ? 'text-indigo-600' : 'text-slate-300'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
