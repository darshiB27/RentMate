// Google OAuth Redirection Landing Page
// Purpose: Captures token and user context from callback URL query params and logs in.
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice.js';
import { decodeJWT } from '../utils/jwt.js';

export default function GoogleSuccessCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('accessToken');
    
    if (token) {
      const decodedUser = decodeJWT(token);
      
      if (decodedUser) {
        // Hydrate Redux state with JWT payload info
        dispatch(
          setCredentials({
            user: {
              id: decodedUser.id || searchParams.get('userId'),
              email: decodedUser.email,
              role: decodedUser.role,
              name: decodedUser.name || 'Google User',
            },
            token,
          })
        );
        
        // Navigate to user dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setError('Google login failed: Access token structure is malformed.');
      }
    } else {
      setError('Google login failed: Authentication token was not returned.');
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="space-y-6 text-center text-slate-300 py-6">
      {error ? (
        <>
          <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">OAuth Error</h2>
            <p className="text-sm text-rose-400">{error}</p>
          </div>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer"
          >
            Return to Login
          </button>
        </>
      ) : (
        <>
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Syncing Session</h2>
            <p className="text-xs text-slate-400">Authenticating via Google credentials, please wait...</p>
          </div>
        </>
      )}
    </div>
  );
}
