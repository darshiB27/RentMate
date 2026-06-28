import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileRequest } from '../features/auth/services/authApi.js';
import { updateUser } from '../features/auth/authSlice.js';

// Validation Schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number')
    .optional()
    .or(z.literal('')),
});

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  // React Query Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateProfileRequest(data),
    onSuccess: (response) => {
      const updatedUser = response.data?.data;
      if (updatedUser) {
        // Sync to Redux & LocalStorage
        dispatch(updateUser({
          name: updatedUser.name,
          phoneNumber: updatedUser.phoneNumber,
        }));
        
        // Reset form values to updated state
        reset({
          name: updatedUser.name,
          phoneNumber: updatedUser.phoneNumber,
        });

        alert('Profile updated successfully!');
      }
    },
    onError: (error) => {
      alert(error?.response?.data?.message || 'Failed to update profile. Please try again.');
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5 space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-sm text-slate-400">View and update your personal details and contact numbers.</p>
      </div>

      {/* Settings Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Read-Only Email Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-400 bg-slate-50 cursor-not-allowed select-none"
              title="Email address cannot be changed."
            />
            <p className="text-[10px] text-slate-400 leading-normal font-medium">
              Registered email addresses are linked to social login credentials and cannot be edited.
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                errors.name ? 'border-rose-300 focus:ring-rose-500/25' : 'border-slate-200 focus:ring-indigo-500/25'
              }`}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-[10px] text-rose-500 font-bold">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
            <input
              type="text"
              {...register('phoneNumber')}
              className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                errors.phoneNumber ? 'border-rose-300 focus:ring-rose-500/25' : 'border-slate-200 focus:ring-indigo-500/25'
              }`}
              placeholder="e.g. 9876543210"
            />
            {errors.phoneNumber && (
              <p className="text-[10px] text-rose-500 font-bold">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
