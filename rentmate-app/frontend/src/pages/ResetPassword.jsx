// Reset Password Screen
// Purpose: Resets user accounts credentials using query tokens.
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPasswordRequest } from '../features/auth/services/authApi.js';

// Reset schema matching backend strength requirements and match comparison
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/\d/, 'Must contain at least one number')
      .regex(/[@$!%*?&#]/, 'Must contain at least one special character (@$!%*?&#)'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match. Please verify.',
    path: ['confirmPassword'],
  });

export default function ResetPassword() {
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Extract reset token from query string
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    if (!token) {
      setErrorMsg('Invalid or missing password reset token.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await resetPasswordRequest({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Password reset failed. The token may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center text-slate-300">
        <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Invalid Reset Link</h2>
          <p className="text-sm text-slate-400">
            This password reset link is invalid, malformed, or has expired. Please request a new link.
          </p>
        </div>
        <Link
          to="/forgot-password"
          className="block w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm transition-colors text-center cursor-pointer"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6 text-center text-slate-300">
        <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Password Updated</h2>
          <p className="text-sm text-slate-400">
            Your password has been successfully updated. You can now sign in with your new credentials.
          </p>
        </div>
        <Link
          to="/login"
          className="block w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm transition-colors text-center cursor-pointer"
        >
          Proceed to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h2>
        <p className="text-xs text-slate-400 mt-1">Please enter your new password below</p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-slate-300">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="password">
            New Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('password')}
            className={`w-full px-4 py-3 rounded-xl bg-slate-800/40 border text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 ${
              errors.password ? 'border-rose-500' : 'border-slate-700/60 focus:border-indigo-500'
            }`}
          />
          {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('confirmPassword')}
            className={`w-full px-4 py-3 rounded-xl bg-slate-800/40 border text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 ${
              errors.confirmPassword ? 'border-rose-500' : 'border-slate-700/60 focus:border-indigo-500'
            }`}
          />
          {errors.confirmPassword && <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
