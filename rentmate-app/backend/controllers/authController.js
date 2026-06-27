import authService from '../services/authService.js';
import passport from '../config/passport.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';
import env from '../config/env.js';

// Cookie settings for secure refresh tokens
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax', // strict for CSRF prevention in prod
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching token expiry)
});

// Helper to extract device and browser context from user agent header
const extractDeviceContext = (req) => {
  const ua = req.headers['user-agent'] || '';
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'Unknown';
  
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  const device = /Mobile|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop';

  return {
    ipAddress,
    userAgent: ua,
    deviceInfo: {
      browser,
      os,
      device,
      location: 'Unknown', // Can be enriched later using GeoIP modules
    }
  };
};

/**
 * Handle new User signup requests.
 */
export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  
  return res
    .status(STATUS_CODES.CREATED)
    .json(new ApiResponse(STATUS_CODES.CREATED, user, 'Verification link sent to your email.'));
});

/**
 * Log in a user via email and credentials.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { deviceInfo, ipAddress, userAgent } = extractDeviceContext(req);

  const result = await authService.loginUser(email, password, deviceInfo, ipAddress, userAgent);

  // Set HTTP-Only refresh token cookie
  return res
    .status(STATUS_CODES.OK)
    .cookie('refreshToken', result.refreshToken, getCookieOptions())
    .json(new ApiResponse(STATUS_CODES.OK, { user: result.user, accessToken: result.accessToken }, 'Logged in successfully.'));
});

/**
 * Handle Google Social login credentials assertion payload (frontend token flow).
 */
export const googleLogin = asyncHandler(async (req, res) => {
  const { deviceInfo, ipAddress, userAgent } = extractDeviceContext(req);

  const result = await authService.loginWithGoogle(req.body, deviceInfo, ipAddress, userAgent);

  return res
    .status(STATUS_CODES.OK)
    .cookie('refreshToken', result.refreshToken, getCookieOptions())
    .json(new ApiResponse(STATUS_CODES.OK, { user: result.user, accessToken: result.accessToken }, 'Authenticated via Google successfully.'));
});

/**
 * @route GET /api/v1/auth/google
 * @desc Initiate the Google OAuth 2.0 redirect flow.
 * Redirects the browser to Google's consent screen.
 * @access Public
 */
export const googleOAuthInitiate = (req, res, next) => {
  const role = req.query?.role || 'tenant';
  // Enforce secure roles only (prevent arbitrary admin escalation)
  const cleanRole = role === 'owner' ? 'owner' : 'tenant';

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: JSON.stringify({ role: cleanRole }),
  })(req, res, next);
};

/**
 * @route GET /api/v1/auth/google/callback
 * @desc Handle Google OAuth redirect callback.
 * Passport verifies the code, runs the Strategy, and places the Mongoose user on req.user.
 * This controller issues JWTs and redirects the browser back to the frontend.
 * @access Public
 */
export const googleOAuthCallback = [
  // Step 1: Passport processes the ?code param and populates req.user
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  // Step 2: Issue tokens and redirect to frontend
  asyncHandler(async (req, res) => {
    const { deviceInfo, ipAddress, userAgent } = extractDeviceContext(req);

    // req.user is the full Mongoose document set by the Passport strategy
    if (!req.user) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Google authentication failed. No user profile received.');
    }

    const result = await authService.handleGoogleCallback(
      req.user,
      deviceInfo,
      ipAddress,
      userAgent
    );

    // Set HTTP-Only refresh token cookie
    res.cookie('refreshToken', result.refreshToken, getCookieOptions());

    // Redirect browser to frontend with access token in query param
    // Frontend reads the token once and stores it in memory / state
    const redirectUrl = new URL(`${env.CLIENT_URL}/auth/google/success`);
    redirectUrl.searchParams.set('accessToken', result.accessToken);
    redirectUrl.searchParams.set('userId', result.user.id);

    return res.redirect(302, redirectUrl.toString());
  }),
];

/**
 * Verify verification tokens sent to email boxes.
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token || req.query.token;
  if (!token) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Email verification token is missing.');
  }

  const result = await authService.verifyEmail(token);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, null, result.message));
});

/**
 * Processes forgot password email checks and sends verification links.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);

  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, null, result.message));
});

/**
 * Resets user credentials using validated token parameters.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);

  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, null, result.message));
});

/**
 * Refresh expired access tokens silently using cookie cookies.
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Refresh session token is missing.');
  }

  const result = await authService.refreshAccessToken(incomingRefreshToken);

  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Session access token renewed.'));
});

/**
 * Logs out the active user and clears session cookies.
 */
export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (incomingRefreshToken) {
    await authService.logoutUser(incomingRefreshToken);
  }

  // Clear cookie headers
  const clearOptions = { ...getCookieOptions(), maxAge: 0 };
  return res
    .status(STATUS_CODES.OK)
    .clearCookie('refreshToken', clearOptions)
    .json(new ApiResponse(STATUS_CODES.OK, null, 'Logged out successfully.'));
});

/**
 * Logs out user from all active logins (all browser sessions).
 */
export const logoutAllDevices = asyncHandler(async (req, res) => {
  const userId = req.user?.id; // Authenticated user ID (attached by protect middleware)
  
  if (!userId) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Session context is missing.');
  }

  await authService.logoutAllDevices(userId);

  const clearOptions = { ...getCookieOptions(), maxAge: 0 };
  return res
    .status(STATUS_CODES.OK)
    .clearCookie('refreshToken', clearOptions)
    .json(new ApiResponse(STATUS_CODES.OK, null, 'Logged out from all active device sessions.'));
});

/**
 * Handles updating user profile settings.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.user.id, req.body);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Profile updated successfully.'));
});

/**
 * Retrieve authenticated user profile details.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
    }, 'Current user profile retrieved successfully.'));
});

export default {
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
};
