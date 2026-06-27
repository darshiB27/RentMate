// Chat Page Component
// Purpose: Core chat shell that links conversations, messages lists, and Socket.io real-time synchronizations.
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getConversations, getMessages, sendMessage, markRead } from '../api/chatApi.js';
import { getMyInquiries } from '../features/inquiries/services/inquiryApi.js';
import useSocket from '../hooks/useSocket.js';
import ChatSidebar from '../components/ChatSidebar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { socket, isConnected } = useSocket();

  // Local state fallbacks
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [localConversations, setLocalConversations] = useState([]);
  const [localMessages, setLocalMessages] = useState({});
  const [typingStatus, setTypingStatus] = useState({}); // { [convoId]: boolean }
  const [onlineUsers, setOnlineUsers] = useState([]);

  const targetInquiryId = searchParams.get('inquiryId');
  const targetConvoId = searchParams.get('conversationId');

  // 1. Fetch Conversations from API
  const { data: conversationsResponse, isError: convoError } = useQuery({
    queryKey: ['chatConversations'],
    queryFn: () => getConversations().then((res) => res.data?.data || []),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // 2. Fetch Inquiries as fallback if chat REST endpoint doesn't exist
  const { data: inquiriesResponse } = useQuery({
    queryKey: ['chatInquiriesFallback'],
    queryFn: () => getMyInquiries({ page: 1, limit: 20 }).then((res) => res.data?.data || {}),
    refetchOnWindowFocus: false,
  });

  // 3. Fetch Messages for selected conversation
  const { data: messagesResponse } = useQuery({
    queryKey: ['chatMessages', activeConvoId],
    queryFn: () => {
      if (!activeConvoId) return [];
      // Don't call API if it is a local-only mock ID (temporary room)
      if (activeConvoId.startsWith('temp_')) return [];
      return getMessages(activeConvoId).then((res) => res.data?.data || []);
    },
    enabled: !!activeConvoId,
    refetchOnWindowFocus: false,
  });

  // Sync React Query data to local state
  useEffect(() => {
    let list = [];
    if (conversationsResponse && conversationsResponse.length > 0) {
      list = [...conversationsResponse];
    } else if (inquiriesResponse?.inquiries) {
      // Map inquiries to conversations format
      list = inquiriesResponse.inquiries.map((inq) => ({
        _id: inq._id,
        inquiryId: inq._id,
        tenantId: inq.tenantId,
        ownerId: inq.ownerId,
        propertyId: inq.propertyId,
        lastMessage: {
          text: inq.message,
          senderId: inq.tenantId?._id || inq.tenantId,
          createdAt: inq.createdAt,
        },
        unreadCount: 0,
      }));
    }
    setLocalConversations(list);
  }, [conversationsResponse, inquiriesResponse]);

  // Sync loaded messages to local messages state
  useEffect(() => {
    if (messagesResponse && activeConvoId) {
      setLocalMessages((prev) => ({
        ...prev,
        [activeConvoId]: messagesResponse,
      }));
      
      // Update read status for conversation
      if (!activeConvoId.startsWith('temp_')) {
        markRead(activeConvoId).catch(() => {});
        setLocalConversations((prev) =>
          prev.map((c) => (c._id === activeConvoId ? { ...c, unreadCount: 0 } : c))
        );
      }
    }
  }, [messagesResponse, activeConvoId]);

  // Handle auto-selection of conversations via URL search params
  useEffect(() => {
    const targetId = targetConvoId || targetInquiryId;
    if (!targetId || localConversations.length === 0) return;

    const exists = localConversations.find((c) => c._id === targetId || c.inquiryId === targetId);
    if (exists) {
      setActiveConvoId(exists._id);
    } else if (targetInquiryId && inquiriesResponse?.inquiries) {
      // If a specific inquiry was requested but isn't in lists, search in inquiries database fallback
      const inq = inquiriesResponse.inquiries.find((i) => i._id === targetInquiryId);
      if (inq) {
        const newConvo = {
          _id: inq._id,
          inquiryId: inq._id,
          tenantId: inq.tenantId,
          ownerId: inq.ownerId,
          propertyId: inq.propertyId,
          lastMessage: {
            text: inq.message,
            senderId: inq.tenantId?._id,
            createdAt: inq.createdAt,
          },
          unreadCount: 0,
        };
        setLocalConversations((prev) => [newConvo, ...prev]);
        setActiveConvoId(inq._id);
      }
    }
  }, [targetInquiryId, targetConvoId, localConversations, inquiriesResponse]);

  // Socket event listener setup
  useEffect(() => {
    if (!socket) return;

    // Join room when active connection changes
    if (activeConvoId) {
      socket.emit('join_conversation', activeConvoId);
    }

    // Listen to real-time incoming messages
    const handleReceiveMessage = (msg) => {
      const convoId = msg.conversationId || msg.inquiryId || activeConvoId;
      
      // Append to message list
      setLocalMessages((prev) => {
        const currentMsgs = prev[convoId] || [];
        // Avoid duplicate messages if socket broadcasts echo
        if (currentMsgs.some((m) => m._id === msg._id)) return prev;
        return {
          ...prev,
          [convoId]: [...currentMsgs, msg],
        };
      });

      // Update conversations list summary
      setLocalConversations((prev) =>
        prev.map((c) => {
          if (c._id === convoId) {
            return {
              ...c,
              lastMessage: {
                text: msg.text,
                senderId: msg.senderId,
                createdAt: msg.createdAt || new Date().toISOString(),
              },
              unreadCount: convoId === activeConvoId ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );

      // Automatically mark read if active
      if (convoId === activeConvoId) {
        socket.emit('read_messages', { conversationId: convoId });
        markRead(convoId).catch(() => {});
      }
    };

    // Listen to typing status broadcasts
    const handleTypingStatus = ({ conversationId, userId, isTyping }) => {
      if (userId === currentUser.id) return;
      setTypingStatus((prev) => ({
        ...prev,
        [conversationId]: isTyping,
      }));
    };

    // Listen to online users list broadcasts
    const handleUserStatus = ({ userId, isOnline }) => {
      setOnlineUsers((prev) => {
        if (isOnline) {
          if (prev.includes(userId)) return prev;
          return [...prev, userId];
        } else {
          return prev.filter((id) => id !== userId);
        }
      });
    };

    // Set up initial listener triggers
    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing_status', handleTypingStatus);
    socket.on('user_status', handleUserStatus);

    return () => {
      if (activeConvoId) {
        socket.emit('leave_conversation', activeConvoId);
      }
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing_status', handleTypingStatus);
      socket.off('user_status', handleUserStatus);
    };
  }, [socket, activeConvoId, currentUser]);

  // Mutation to send messages
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, text }) => sendMessage(conversationId, text),
    onSuccess: (res, variables) => {
      const msg = res.data?.data;
      if (msg) {
        // Update local list
        setLocalMessages((prev) => {
          const currentMsgs = prev[variables.conversationId] || [];
          if (currentMsgs.some((m) => m._id === msg._id)) return prev;
          return {
            ...prev,
            [variables.conversationId]: [...currentMsgs, msg],
          };
        });
      }
    },
    onError: (err, variables) => {
      console.warn('REST save message failed, executing pure socket broadcast fallback');
      
      // Fallback: Send directly via socket connection
      if (socket && isConnected) {
        const convo = localConversations.find((c) => c._id === variables.conversationId);
        const recipient = currentUser?.role === 'tenant' ? convo?.ownerId : convo?.tenantId;
        const receiverId = recipient?._id || recipient;

        const mockMsg = {
          _id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          conversationId: variables.conversationId,
          senderId: currentUser.id,
          receiverId,
          text: variables.text,
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        socket.emit('send_message', mockMsg);

        // Update local UI state directly
        setLocalMessages((prev) => ({
          ...prev,
          [variables.conversationId]: [...(prev[variables.conversationId] || []), mockMsg],
        }));

        setLocalConversations((prev) =>
          prev.map((c) =>
            c._id === variables.conversationId
              ? {
                  ...c,
                  lastMessage: {
                    text: variables.text,
                    senderId: currentUser.id,
                    createdAt: new Date().toISOString(),
                  },
                }
              : c
          )
        );
      }
    },
  });

  const handleSendMessage = (text) => {
    if (!activeConvoId) return;
    sendMessageMutation.mutate({ conversationId: activeConvoId, text });
  };

  const selectedConversation = localConversations.find((c) => c._id === activeConvoId);
  const activeChatMessages = localMessages[activeConvoId] || [];

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden h-[calc(100vh-140px)] flex flex-col md:flex-row">
      {/* Sidebar List */}
      <ChatSidebar
        conversations={localConversations}
        selectedId={activeConvoId}
        onSelect={setActiveConvoId}
        currentUser={currentUser}
        onlineUserIds={onlineUsers}
      />

      {/* Main Conversation Dialog window */}
      <ChatWindow
        conversation={selectedConversation}
        messages={activeChatMessages}
        onSend={handleSendMessage}
        currentUser={currentUser}
        isTyping={typingStatus[activeConvoId] || false}
        socket={socket}
      />
    </div>
  );
}
