// Login Screen
// Purpose: Authenticates users using email/password or Google social auth redirect hooks.
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginRequest } from '../features/auth/services/authApi.js';
import { setCredentials } from '../features/auth/authSlice.js';
import GoogleBtn from '../features/auth/components/GoogleBtn.jsx';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email format')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export default function Login() {
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('tenant');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Find location destination before authenticating (for redirection matching)
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await loginRequest(data);
      const payload = response.data?.data;
      
      if (payload?.accessToken && payload?.user) {
        dispatch(setCredentials({ user: payload.user, token: payload.accessToken }));
        navigate(from, { replace: true });
      } else {
        setErrorMsg('Invalid session data received from server.');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-1">Sign in to search properties and manage inquiries</p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Role Selector Toggle */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          I want to sign in / register as
        </label>
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => setRole('tenant')}
            className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              role === 'tenant'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tenant (Search Rooms)
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              role === 'owner'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Owner (Post Rooms)
          </button>
        </div>
      </div>

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

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="password">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot Password?
            </Link>
          </div>
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
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="relative my-6 flex items-center justify-center">
        <span className="absolute w-full h-[1px] bg-slate-800" />
        <span className="relative z-10 px-3 bg-[#111726] text-xs text-slate-500 uppercase tracking-widest">
          Or Continue With
        </span>
      </div>

      <GoogleBtn role={role} />

      <div className="text-center text-xs text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Create Account
        </Link>
      </div>
    </div>
  );
}
