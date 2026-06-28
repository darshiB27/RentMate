// Authentication Router Endpoints Collection
// Purpose: Maps auth URLs to controller actions, enforces input Zod validations, protects endpoints, and sets rate limiting.
import express from 'express';
import rateLimit from 'express-rate-limit';

import {
  register,
  login,
  googleLogin,
  googleOAuthInitiate,
  googleOAuthCallback,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  logoutAllDevices,
  updateProfile,
  getMe,
} from '../controllers/authController.js';
import { validateSchema } from '../middleware/validateMiddleware.js';
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.validator.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// Strict Rate Limiter for Authentication Channels (Defends against brute-force logins and registration spam)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per 15 minutes on auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication requests from this IP. Please try again after 15 minutes.',
});

// Mount Rate Limiter on all authentication routes
router.use(authRateLimiter);

// POST /register - Register new account
router.post('/register', validateSchema(registerSchema), register);

// POST /login - Log in with email credentials
router.post('/login', validateSchema(loginSchema), login);

// POST /google - Google OAuth assertion token verification (frontend credential token flow)
router.post('/google', validateSchema(googleLoginSchema), googleLogin);

// ---------------------------------------------------------------------------
// Google OAuth 2.0 Redirect Flow (Passport Strategy)
// ---------------------------------------------------------------------------

// GET /google/redirect - Initiate Google consent screen redirect
// Browser navigates to this URL to begin the OAuth handshake
router.get('/google/redirect', googleOAuthInitiate);
router.get('/google', googleOAuthInitiate);

// GET /google/callback - Google redirects back here after user consents
// Passport processes the auth code, runs the Strategy, sets req.user,
// then the controller issues JWTs and redirects to the frontend.
router.get('/google/callback', googleOAuthCallback);

// GET /verify-email/:token - Verify account email using route parameters
router.get('/verify-email/:token', verifyEmail);

// POST /forgot-password - Send password reset email links
router.post('/forgot-password', validateSchema(forgotPasswordSchema), forgotPassword);

// POST /reset-password - Reset credentials using tokens
router.post('/reset-password', validateSchema(resetPasswordSchema), resetPassword);

// POST /refresh - Refresh expired access tokens silently
// refreshTokenSchema validates the optional body token field (cookie is also accepted)
router.post('/refresh', validateSchema(refreshTokenSchema.partial()), refreshAccessToken);

// POST /logout - Clear cookie headers
router.post('/logout', logout);

// POST /logout-all - Logout from all devices (Protected endpoint)
router.post('/logout-all', verifyJWT, logoutAllDevices);

// PATCH /profile - Update authenticated user profile settings
router.patch('/profile', verifyJWT, updateProfile);

// GET /me - Get authenticated user profile details
router.get('/me', verifyJWT, getMe);

export default router;
