// Chat Sidebar Conversations List Component
// Purpose: Lists all inquiry-associated chats, filters entries, and highlights selected chats.
import React, { useState } from 'react';

export default function ChatSidebar({
  conversations,
  selectedId,
  onSelect,
  currentUser,
  onlineUserIds,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const getRecipientInfo = (convo) => {
    // If tenant, other party is owner. If owner, other party is tenant.
    const isTenant = currentUser?.role === 'tenant';
    const recipient = isTenant ? convo.ownerId : convo.tenantId;
    return recipient || { name: 'Unknown User', email: '' };
  };

  // Filter conversations by participant name or property title
  const filteredConversations = conversations.filter((convo) => {
    const recipient = getRecipientInfo(convo);
    const propertyTitle = convo.propertyId?.title || '';
    const query = searchQuery.toLowerCase();
    return (
      recipient.name?.toLowerCase().includes(query) ||
      propertyTitle.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full md:w-80 flex flex-col bg-white border-r border-slate-200/60 h-full overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Messages</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search chat or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 transition-all"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1">
            <p className="text-xs font-bold text-slate-500">No chats found</p>
            <p className="text-[10px] text-slate-400">Submit inquiry to start chatting.</p>
          </div>
        ) : (
          filteredConversations.map((convo) => {
            const recipient = getRecipientInfo(convo);
            const property = convo.propertyId || {};
            const isSelected = selectedId === convo._id;
            const isOnline = onlineUserIds.includes(recipient._id);
            const unreadCount = convo.unreadCount || 0;

            const lastMsgText = convo.lastMessage?.text || 'No messages yet';
            const lastMsgTime = convo.lastMessage?.createdAt
              ? new Date(convo.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
              : '';

            return (
              <button
                key={convo._id}
                onClick={() => onSelect(convo._id)}
                className={`w-full text-left p-4 flex gap-3 transition-colors cursor-pointer items-start ${
                  isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Avatar with Online indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 font-black text-slate-600 text-xs flex items-center justify-center border border-slate-200">
                    {recipient.name?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Body details */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{recipient.name}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">{lastMsgTime}</span>
                  </div>
                  
                  <p className="text-[10px] text-indigo-600 font-bold truncate">
                    {property.title || 'Inquiry Room'}
                  </p>
                  
                  <p className="text-[11px] text-slate-400 truncate font-medium">
                    {lastMsgText}
                  </p>
                </div>

                {/* Unread count badge */}
                {unreadCount > 0 && (
                  <span className="flex-shrink-0 self-center px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
