// Direct Contact Form Component
// Purpose: Captures tenant cell info and messages validation prior to transmission.
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { postInquiry } from '../services/inquiryApi.js';
import { ROLES } from '../../../constants/roles.js';

const inquirySchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Must be a valid format (e.g. +919876543210)'),
  preferredVisitDate: z
    .string()
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters')
    .trim(),
});

export default function ContactOwnerForm({ propertyId }) {
  const { user, token } = useSelector((state) => state.auth);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      phoneNumber: user?.phoneNumber || '',
      preferredVisitDate: '',
      message: 'Hi, I am interested in this listing. Please let me know when I can visit.',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        propertyId,
        message: data.message,
        phoneNumber: data.phoneNumber,
      };

      // Convert preferredVisitDate to ISO date if selected
      if (data.preferredVisitDate) {
        payload.preferredVisitDate = new Date(data.preferredVisitDate).toISOString();
      }

      await postInquiry(payload);
      setSuccess(true);
      reset();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth gate checks
  if (!token || !user) {
    return (
      <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl text-center space-y-4">
        <h4 className="font-bold text-slate-800 text-sm">Interested in this property?</h4>
        <p className="text-xs text-slate-400">Log in as a tenant to direct message the owner and schedule visits.</p>
        <Link
          to="/login"
          state={{ from: location }}
          className="block w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors text-center cursor-pointer"
        >
          Sign In to Send Inquiry
        </Link>
      </div>
    );
  }

  if (user.role !== ROLES.TENANT) {
    return (
      <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl text-center text-slate-500 text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        Only Tenant accounts can submit inquiries for stays.
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-200/50 p-6 rounded-2xl text-center space-y-3">
        <div className="mx-auto w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h4 className="font-bold text-slate-800 text-sm">Inquiry Submitted!</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          The property owner has been notified. You can track this inquiry in your dashboard.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
        >
          Send Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-slate-800 text-sm">Inquire About This Room</h3>
        <p className="text-[10px] text-slate-400">Direct message owner & request coordinates visit</p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-slate-700">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="phoneNumber">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            disabled={isLoading}
            placeholder="+919876543210"
            {...register('phoneNumber')}
            className={`w-full text-xs font-semibold px-3 py-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden ${
              errors.phoneNumber ? 'border-rose-500' : 'border-slate-200'
            }`}
          />
          {errors.phoneNumber && <p className="text-[10px] text-rose-500 mt-1">{errors.phoneNumber.message}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="preferredVisitDate">
            Preferred Visit Date (Optional)
          </label>
          <input
            id="preferredVisitDate"
            type="date"
            disabled={isLoading}
            {...register('preferredVisitDate')}
            className="w-full text-xs font-semibold px-3 py-2.5 border rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            rows="4"
            disabled={isLoading}
            placeholder="Type your question..."
            {...register('message')}
            className={`w-full text-xs font-medium px-3 py-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden ${
              errors.message ? 'border-rose-500' : 'border-slate-200'
            }`}
          />
          {errors.message && <p className="text-[10px] text-rose-500 mt-1">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors duration-150 cursor-pointer"
        >
          {isLoading ? 'Sending Inquiry...' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
}
