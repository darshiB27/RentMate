// Chat Window Component
// Purpose: Manages conversation stream, handles auto-scrolling, renders typing indicators, and wraps text composer inputs.
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import MessageInput from './MessageInput.jsx';
import { Link } from 'react-router-dom';

export default function ChatWindow({
  conversation,
  messages,
  onSend,
  currentUser,
  isTyping,
  socket,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8 text-center text-slate-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12 text-slate-300 mb-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.694l1.086 1.724a1.125 1.125 0 0 0 1.912 0l1.086-1.724a1.125 1.125 0 0 1 1.153-.694c1.09-.085 2.17-.207 3.238-.364 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
        <h3 className="font-extrabold text-slate-700 text-sm">No Active Conversation</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Select a chat room from the sidebar listing to begin messaging in real-time.
        </p>
      </div>
    );
  }

  const isTenant = currentUser?.role === 'tenant';
  const recipient = isTenant ? conversation.ownerId : conversation.tenantId;
  const property = conversation.propertyId || {};

  return (
    <div className="flex-1 flex flex-col bg-slate-50/30 h-full overflow-hidden">
      {/* Active Conversation Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-xs flex items-center justify-center">
            {recipient?.name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 leading-tight">{recipient?.name}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">{recipient?.email}</p>
          </div>
        </div>

        {/* Property Reference Card Link */}
        {property._id && (
          <Link
            to={`/property/${property._id}`}
            className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 hover:border-indigo-100 p-2 rounded-xl text-left transition-colors max-w-xs"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
              <img
                src={property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=60&q=80'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h5 className="text-[10px] font-extrabold text-slate-800 truncate leading-tight">{property.title}</h5>
              <p className="text-[9px] text-indigo-600 font-bold leading-none mt-0.5">₹{property.price?.toLocaleString('en-IN')}/mo</p>
            </div>
          </Link>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
            <p className="text-xs font-bold text-slate-500">Say Hello!</p>
            <p className="text-[10px] text-slate-400">No messages in this chat room yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOutgoing={msg.senderId === currentUser?.id}
              senderName={msg.senderId === currentUser?.id ? currentUser.name : recipient?.name}
            />
          ))
        )}

        {/* Real-Time Typing status indicator bubble */}
        {isTyping && (
          <div className="flex gap-3 max-w-lg mr-auto items-end">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-[10px] flex items-center justify-center flex-shrink-0">
              {recipient?.name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-xs text-xs font-bold text-slate-400">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Footer Input */}
      <MessageInput
        onSend={onSend}
        conversationId={conversation._id}
        socket={socket}
      />
    </div>
  );
}
