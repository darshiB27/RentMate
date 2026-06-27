// Forgot Password Screen
// Purpose: Submits email accounts to request password recovery tokens.
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../features/auth/services/authApi.js';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
});

export default function ForgotPassword() {
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await forgotPasswordRequest(data);
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to submit password reset request. Please check email address.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center text-slate-300">
        <div className="mx-auto w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Check Your Inbox</h2>
          <p className="text-sm text-slate-400">
            If the email exists, we have sent password reset instructions to your address.
          </p>
        </div>
        <Link
          to="/login"
          className="block w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm transition-colors text-center cursor-pointer"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h2>
        <p className="text-xs text-slate-400 mt-1">Enter your email address to receive a password reset link</p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-slate-300">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            {...register('email')}
            className={`w-full px-4 py-3 rounded-xl bg-slate-800/40 border text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 ${
              errors.email ? 'border-rose-500' : 'border-slate-700/60 focus:border-indigo-500'
            }`}
          />
          {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Sending Link...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Remember your password?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
}
