// Message Input Composer Component
// Purpose: Captures typing input logs, submits message packets, and broadcasts typing indicators status.
import React, { useState, useEffect, useRef } from 'react';

export default function MessageInput({ onSend, conversationId, socket }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Clean up typing status on change of conversation
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket && isTypingRef.current && conversationId) {
        socket.emit('typing', { conversationId, isTyping: false });
      }
    };
  }, [conversationId, socket]);

  const handleInputChange = (e) => {
    setText(e.target.value);

    if (!socket || !conversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { conversationId, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing', { conversationId, isTyping: false });
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSend(text.trim());
    setText('');

    // Clear typing status immediately upon sending
    if (socket && conversationId && isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('typing', { conversationId, isTyping: false });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  return (
    <form onSubmit={handleSend} className="bg-white border-t border-slate-100 p-4 flex gap-3 items-center">
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 transition-all"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs hover:shadow-md disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all cursor-pointer flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
        </svg>
      </button>
    </form>
  );
}
