// Register Screen
// Purpose: Enables new Tenant/Owner onboarding with input schema validation checks.
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { registerRequest } from '../features/auth/services/authApi.js';
import GoogleBtn from '../features/auth/components/GoogleBtn.jsx';

// Register schema matching backend rules
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/\d/, 'Must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Must contain at least one special character (@$!%*?&#)'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Must be valid E.164 format (e.g. +919876543210)')
    .optional()
    .or(z.literal('')),
  role: z.enum(['tenant', 'owner']).default('tenant'),
});

export default function Register() {
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: 'tenant',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // If phone number is empty string, remove it from payload
      const payload = { ...data };
      if (!payload.phoneNumber) {
        delete payload.phoneNumber;
      }
      
      await registerRequest(payload);
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center text-slate-300">
        <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Registration Successful!</h2>
          <p className="text-sm text-slate-400">
            An email verification link has been sent to your registered email address.
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Please verify your email before attempting to login.
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
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Create an Account</h2>
        <p className="text-xs text-slate-400 mt-1">Get started to discover properties or post listings</p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-slate-300">
        {/* Role Selector Toggle */}
        <div>
          <input type="hidden" {...register('role')} />
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            I want to register as
          </label>
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setValue('role', 'tenant')}
              className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedRole === 'tenant'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tenant (Search Rooms)
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'owner')}
              className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedRole === 'owner'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Owner (Post Rooms)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={isLoading}
            {...register('name')}
            className={`w-full px-4 py-3 rounded-xl bg-slate-800/40 border text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 ${
              errors.name ? 'border-rose-500' : 'border-slate-700/60 focus:border-indigo-500'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
        </div>

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

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="phoneNumber">
            Phone Number (Optional)
          </label>
          <input
            id="phoneNumber"
            type="tel"
            placeholder="+919876543210"
            disabled={isLoading}
            {...register('phoneNumber')}
            className={`w-full px-4 py-3 rounded-xl bg-slate-800/40 border text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 ${
              errors.phoneNumber ? 'border-rose-500' : 'border-slate-700/60 focus:border-indigo-500'
            }`}
          />
          {errors.phoneNumber && <p className="text-xs text-rose-400 mt-1">{errors.phoneNumber.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="password">
            Password
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="relative my-6 flex items-center justify-center">
        <span className="absolute w-full h-[1px] bg-slate-800" />
        <span className="relative z-10 px-3 bg-[#111726] text-xs text-slate-500 uppercase tracking-widest">
          Or Register With
        </span>
      </div>

      <GoogleBtn role={selectedRole} />

      <div className="text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
}
