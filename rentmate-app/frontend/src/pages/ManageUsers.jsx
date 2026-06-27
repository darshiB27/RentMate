import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, blockUser, unblockUser, verifyOwner, softDeleteUser } from '../features/admin/services/adminApi.js';

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [blockStatus, setBlockStatus] = useState(''); // 'true', 'false', or ''
  const limit = 10;

  // Query users
  const { data: usersResponse, isLoading, isError, error } = useQuery({
    queryKey: ['adminUsers', page, search, role, blockStatus],
    queryFn: () =>
      getUsers({
        page,
        limit,
        search,
        role,
        isBlocked: blockStatus,
      }).then((res) => res.data?.data || {}),
  });

  const users = usersResponse?.users || [];
  const pagination = usersResponse?.pagination || null;

  // Block user mutation
  const blockMutation = useMutation({
    mutationFn: (id) => blockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // Unblock user mutation
  const unblockMutation = useMutation({
    mutationFn: (id) => unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // Verify owner mutation
  const verifyMutation = useMutation({
    mutationFn: (id) => verifyOwner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => softDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  const handleBlockToggle = (id, isBlocked) => {
    if (isBlocked) {
      unblockMutation.mutate(id);
    } else {
      if (confirm('Are you sure you want to block this user account?')) {
        blockMutation.mutate(id);
      }
    }
  };

  const handleVerifyOwner = (id) => {
    if (confirm('Verify this user as a Property Owner? This will promote their role to owner.')) {
      verifyMutation.mutate(id);
    }
  };

  const handleDelete = (id) => {
    if (confirm('WARNING: Are you sure you want to delete this user? This action is soft-deleting and irreversible via the client.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
          User Accounts
        </h1>
        <p className="text-sm text-slate-400">Search registered users, toggle block lists, promote roles, and manage permissions.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 min-w-[280px] gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 transition-all"
          />
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          {/* Role Filter */}
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="tenant">Tenant</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={blockStatus}
            onChange={(e) => {
              setBlockStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="false">Active Only</option>
            <option value="true">Blocked Only</option>
          </select>
        </div>
      </div>

      {/* Error View */}
      {isError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-2xl text-center max-w-md mx-auto text-xs font-semibold">
          {error?.response?.data?.message || error?.message || 'Failed to load user accounts list.'}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-100 rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded-md" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    No matching users found in the system.
                  </td>
                </tr>
              ) : (
                users.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-slate-50/30 transition-colors">
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-800">{userItem.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{userItem.email}</div>
                    </td>

                    {/* Role badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          userItem.role === 'admin'
                            ? 'bg-rose-100 text-rose-700'
                            : userItem.role === 'owner'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {userItem.role}
                      </span>
                    </td>

                    {/* Block status / Owner status badge */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center flex-wrap">
                        {userItem.isBlocked ? (
                          <span className="inline-block text-[9px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-block text-[9px] bg-emerald-50 text-emerald-600 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Active
                          </span>
                        )}
                        {userItem.role === 'owner' && userItem.isVerified && (
                          <span className="inline-block text-[9px] bg-cyan-50 text-cyan-600 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {userItem.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle block status */}
                          <button
                            onClick={() => handleBlockToggle(userItem._id, userItem.isBlocked)}
                            disabled={blockMutation.isPending || unblockMutation.isPending}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                              userItem.isBlocked
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/50'
                            }`}
                          >
                            {userItem.isBlocked ? 'Unblock' : 'Block'}
                          </button>

                          {/* Promote Tenant to Owner */}
                          {userItem.role === 'tenant' && (
                            <button
                              onClick={() => handleVerifyOwner(userItem._id)}
                              disabled={verifyMutation.isPending}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] shadow-xs transition-colors cursor-pointer"
                            >
                              Verify Owner
                            </button>
                          )}

                          {/* Delete Account */}
                          <button
                            onClick={() => handleDelete(userItem._id)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 bg-slate-50/30 border-t border-slate-100">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-[10px] transition-colors cursor-pointer"
            >
              Prev
            </button>
            <span className="text-[10px] text-slate-500 font-bold">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
              disabled={page >= pagination.pages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold text-[10px] transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
