import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, getUnreadCount, markAllRead, markRead } from '../services/notificationApi.js';
import { setUnreadCount } from '../notificationSlice.js';
import { timeAgo } from '../../../utils/formatters.js';
import useSocket from '../../../hooks/useSocket.js';

export default function NotificationDropdown({ isOpen, onClose }) {
  const containerRef = useRef(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['dropdownNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, queryClient]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch unread count globally to sync Redux store state (polls every 30s)
  const { data: countVal } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => getUnreadCount().then((res) => res.data?.data?.count ?? 0),
    refetchInterval: 30000,
    enabled: !!user,
  });

  // Sync Redux store on value change
  useEffect(() => {
    if (countVal !== undefined) {
      dispatch(setUnreadCount(countVal));
    }
  }, [countVal, dispatch]);

  // Fetch latest 5 notifications (only when open)
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['dropdownNotifications'],
    queryFn: () => getNotifications({ page: 1, limit: 5 }).then((res) => res.data?.data?.notifications || []),
    enabled: isOpen && !!user,
  });

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: (id) => markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dropdownNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dropdownNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
    },
  });

  if (!isOpen) return null;

  const notifications = notificationsData || [];
  const hasUnread = notifications.some(n => !n.isRead);
  const notificationsUrl = user ? `/${user.role}/notifications` : '/dashboard';

  return (
    <div
      ref={containerRef}
      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden transform origin-top-right transition-all duration-200"
    >
      {/* Dropdown Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <span className="text-sm font-extrabold text-slate-800">Recent Alerts</span>
        {hasUnread && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Dropdown Body */}
      <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse font-semibold">
            Loading recent alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <svg
              className="w-8 h-8 mx-auto text-slate-300 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
            <p className="text-xs font-semibold text-slate-500">No notifications yet</p>
            <p className="text-[10px] text-slate-400 mt-1">We will alert you when something happens.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.isRead) markReadMutation.mutate(n._id);
              }}
              className={`p-4 flex gap-3 transition-colors cursor-pointer hover:bg-slate-50/80 ${
                !n.isRead ? 'bg-indigo-50/10' : ''
              }`}
            >
              {/* Type Badge Indicators */}
              <div className="shrink-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full block mt-1.5 ${
                    !n.isRead ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-slate-300'
                  }`}
                />
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs text-slate-700 leading-normal ${!n.isRead ? 'font-bold text-slate-900' : ''}`}>
                  {n.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{n.message}</p>
                <span className="text-[9px] font-semibold text-slate-400 mt-1.5 block">
                  {timeAgo(n.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dropdown Footer */}
      <Link
        to={notificationsUrl}
        onClick={onClose}
        className="block text-center py-3 border-t border-slate-100 text-xs font-bold text-indigo-600 hover:bg-slate-50 transition-colors"
      >
        View all notifications
      </Link>
    </div>
  );
}
