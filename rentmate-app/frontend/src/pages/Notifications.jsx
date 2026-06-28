import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllRead, markRead, deleteNotification } from '../features/notifications/services/notificationApi.js';
import NotificationItem from '../features/notifications/components/NotificationItem.jsx';
import useSocket from '../hooks/useSocket.js';

export default function Notifications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 8; // 8 notifications per page
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      // Prepend to React Query Cache for ['allNotifications', page]
      queryClient.setQueryData(['allNotifications', page], (oldData) => {
        if (!oldData) return oldData;
        const currentList = oldData.notifications || [];
        if (currentList.some((n) => n._id === newNotif._id)) return oldData;

        return {
          ...oldData,
          notifications: [newNotif, ...currentList],
          pagination: {
            ...oldData.pagination,
            total: (oldData.pagination?.total || 0) + 1,
          },
        };
      });

      // Invalidate count & dropdown alerts
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['dropdownNotifications'] });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, page, queryClient]);

  // Fetch paginated notifications
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['allNotifications', page],
    queryFn: () => getNotifications({ page, limit }).then((res) => res.data?.data || {}),
  });

  const notifications = responseData?.notifications || [];
  const pagination = responseData?.pagination || null;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark single as read mutation
  const markReadMutation = useMutation({
    mutationFn: (id) => markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['dropdownNotifications'] });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['dropdownNotifications'] });
    },
  });

  // Delete single notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['dropdownNotifications'] });
    },
  });

  const handleMarkRead = (id) => {
    markReadMutation.mutate(id);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Notifications Log</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-indigo-100 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400">View and manage system updates, inquiries progress, and listing alerts</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="self-start sm:self-center px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
          >
            {markAllReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Error State */}
      {isError && (
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 text-center text-slate-700 max-w-md mx-auto shadow-xs">
          <h3 className="font-extrabold text-rose-800 text-lg">Failed to load alerts</h3>
          <p className="text-xs text-rose-600 mt-2 leading-relaxed">
            {error?.response?.data?.message || error?.message || 'An error occurred while fetching your notifications.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-6 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs animate-pulse h-20" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && notifications.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>
          <h3 className="font-extrabold text-slate-800 text-lg">No Notifications</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
            Your inbox is completely clear! We will display real-time updates and activity notifications here.
          </p>
        </div>
      )}

      {/* Main List */}
      {!isLoading && !isError && notifications.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-4">
            {notifications.map((n) => (
              <NotificationItem
                key={n._id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination Indicators */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-xs transition-colors cursor-pointer"
              >
                Prev
              </button>
              <span className="text-xs text-slate-500 font-semibold">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                disabled={page >= pagination.pages}
                className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-xs transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
