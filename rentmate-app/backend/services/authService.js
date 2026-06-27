import crypto from 'crypto';
import executeTransaction from '../utils/executeTransaction.js';

import {
  findOneUser,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  updateLastLogin
} from '../repositories/auth.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/tokenUtils.js';
import { sendEmail } from '../config/nodemailer.js';
import env from '../config/env.js';
import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';
import MESSAGES from '../constants/messages.js';

/**
 * Registers a new tenant or owner.
 * @param {Object} userData - Form values: { name, email, password, phoneNumber, role }.
 * @returns {Promise<Object>} - Clean user object.
 */
export const registerUser = async (userData) => {
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Email address is already registered. Please log in.');
  }

  // Enforce role security validation: ensure only 'tenant' and 'owner' are accepted, and never allow 'admin'
  if (userData.role && !['tenant', 'owner'].includes(userData.role)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Invalid role selection.');
  }

  // Create temporary email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // Token active for 24 hours

  const user = await createUser({
    ...userData,
    verificationToken,
    verificationTokenExpire,
    isVerified: false, // User must verify email to log in
  });

  // Construct and send confirmation link
  const verificationLink = `${env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  const emailHtml = `
    <h1>Welcome to RentMate!</h1>
    <p>Hi ${user.name},</p>
    <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
    <a href="${verificationLink}" target="_blank">Verify Email Address</a>
    <br/><br/>
    <p>This verification link will expire in 24 hours.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your RentMate account',
      html: emailHtml,
    });
  } catch (emailError) {
    logger.error(`Verification email delivery failed for ${user.email}: ${emailError.message}`);
    // Do not abort registration if email fail, but alert in logs
  }

  // Hide sensitive schema keys from return
  const cleanUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  return cleanUser;
};

/**
 * Log in a user using Email and Password.
 * @param {string} email - Email input.
 * @param {string} password - Password input.
 * @param {Object} deviceInfo - Client browser/os properties.
 * @param {string} ipAddress - Client IP Address.
 * @param {string} userAgent - Client User Agent string.
 * @returns {Promise<Object>} - User details, accessToken, and refreshToken.
 */
export const loginUser = async (email, password, deviceInfo, ipAddress, userAgent) => {
  // Select password explicitly since it is hidden by default
  const user = await findUserByEmail(email, { select: '+password' });
  if (!user) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.AUTH.INVALID_CREDENTIALS);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.AUTH.INVALID_CREDENTIALS);
  }

  // Account Status Checks
  if (user.isDeleted) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'This account has been deleted.');
  }
  if (user.isBlocked) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'This account is blocked. Please contact support.');
  }
  if (!user.isVerified) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Your email has not been verified yet. Please check your inbox.');
  }

  // Generate Session Tokens
  const payload = user.generateAccessTokenPayload();
  const accessToken = generateAccessToken(payload);
  const refreshTokenString = generateRefreshToken({ id: user._id });

  // Save Refresh Token in Database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Expires in 7 days
  await saveRefreshToken({
    userId: user._id,
    token: refreshTokenString,
    deviceInfo,
    ipAddress,
    userAgent,
    expiresAt,
  });

  // Log active login timestamp asynchronously
  updateLastLogin(user._id).catch(err => logger.error(`Error updating login timestamp for ${user._id}: ${err.message}`));

  return {
    user: payload,
    accessToken,
    refreshToken: refreshTokenString,
  };
};

/**
 * Log in or create a user via Google OAuth profile callback payload.
 * @param {Object} profilePayload - User Google profile details.
 * @param {Object} deviceInfo - Client browser/os properties.
 * @param {string} ipAddress - Client IP.
 * @param {string} userAgent - Client User Agent.
 * @returns {Promise<Object>} - User details, accessToken, and refreshToken.
 */
export const loginWithGoogle = async (profilePayload, deviceInfo, ipAddress, userAgent) => {
  // Query by googleId or email address first (outside transaction – read-only)
  let user = await findOneUser({
    $or: [{ googleId: profilePayload.googleId }, { email: profilePayload.email }]
  });

  // Execute create/link operations inside a safe transaction
  return await executeTransaction(async (session) => {
    if (user) {
      // If user exists but googleId is not linked, link Google ID
      if (!user.googleId) {
        user = await updateUser(user._id, { googleId: profilePayload.googleId }, { session, newDoc: true });
      }

      if (user.isDeleted) throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'This account has been deleted.');
      if (user.isBlocked) throw new ApiError(STATUS_CODES.FORBIDDEN, 'This account has been blocked.');
    } else {
      // Create new verified account for social sign-in
      user = await createUser(
        {
          name: profilePayload.name,
          email: profilePayload.email,
          googleId: profilePayload.googleId,
          avatar: { url: profilePayload.avatar || '' },
          role: profilePayload.role || 'tenant',
          isVerified: true, // Google profile emails are pre-verified
        },
        { session }
      );
    }

    // Generate Session Tokens
    const payload = user.generateAccessTokenPayload();
    const accessToken = generateAccessToken(payload);
    const refreshTokenString = generateRefreshToken({ id: user._id });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await saveRefreshToken(
      {
        userId: user._id,
        token: refreshTokenString,
        deviceInfo,
        ipAddress,
        userAgent,
        expiresAt,
      },
      { session }
    );

    await updateLastLogin(user._id, { session });

    return {
      user: payload,
      accessToken,
      refreshToken: refreshTokenString,
    };
  });
};

/**
 * Handles the Passport Google OAuth redirect callback.
 * Called by the route handler AFTER Passport has already:
 *   - Found / created the user in the DB.
 *   - Linked googleId.
 *   - Marked isVerified=true.
 *   - Updated lastLogin.
 * This function's sole job is to issue JWT access + refresh tokens.
 *
 * @param {Object} user - Full Mongoose User document passed via req.user from Passport.
 * @param {Object} deviceInfo - Client device metadata.
 * @param {string} ipAddress - Client IP address.
 * @param {string} userAgent - Client user-agent string.
 * @returns {Promise<Object>} - { user: payload, accessToken, refreshToken }
 */
export const handleGoogleCallback = async (user, deviceInfo, ipAddress, userAgent) => {
  // Generate JWT tokens
  const payload = user.generateAccessTokenPayload();
  const accessToken = generateAccessToken(payload);
  const refreshTokenString = generateRefreshToken({ id: user._id });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Persist refresh token session (non-transactional — standalone-safe)
  await saveRefreshToken({
    userId: user._id,
    token: refreshTokenString,
    deviceInfo,
    ipAddress,
    userAgent,
    expiresAt,
  });

  logger.info(`[Auth Service] Google OAuth session tokens issued for user: ${user.email}`);

  return {
    user: payload,
    accessToken,
    refreshToken: refreshTokenString,
  };
};

/**
 * Verifies email verification tokens.
 * @param {string} token - Verification token string.
 */
export const verifyEmail = async (token) => {
  // Query user matching verification token and verify expiry is in the future
  const user = await findOneUser({
    verificationToken: token,
    verificationTokenExpire: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Invalid or expired email verification token.');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  return { message: MESSAGES.AUTH.EMAIL_VERIFIED };
};

/**
 * Initiates forgot password request and generates a temporary reset link.
 * @param {string} email - Targets account email.
 */
export const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    // For security, don't leak user existence; return generic success logs
    logger.warn(`Password reset requested for unregistered email: ${email}`);
    return { message: 'If this email is registered, a password reset link has been dispatched.' };
  }

  // Generate plain reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Store hashed version of reset token in database for security
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000; // Token active for 15 minutes

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordTokenExpire = resetPasswordTokenExpire;
  await user.save();

  const resetLink = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const emailHtml = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset. Please click the link below to verify and configure a new password:</p>
    <a href="${resetLink}" target="_blank">Reset Password</a>
    <br/><br/>
    <p>If you did not request this, please ignore this message. The link will expire in 15 minutes.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'RentMate - Reset Account Password',
      html: emailHtml,
    });
  } catch (emailError) {
    logger.error(`Password reset email dispatch failure for ${user.email}: ${emailError.message}`);
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Unable to dispatch reset email. Please try again later.');
  }

  return { message: 'If this email is registered, a password reset link has been dispatched.' };
};

/**
 * Validates reset token and updates the user's password.
 * @param {string} token - Raw reset token.
 * @param {string} newPassword - New password value.
 */
export const resetPassword = async (token, newPassword) => {
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user by hashed reset token and check expiration (outside transaction – read-only)
  const user = await findOneUser({
    resetPasswordToken,
    resetPasswordTokenExpire: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Invalid or expired password reset token.');
  }

  // Transactional: save new password + revoke all active refresh sessions atomically
  await executeTransaction(async (session) => {
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;

    // Save document (triggers pre-save bcrypt hashing middleware)
    await user.save({ session });

    // Revoke all active login sessions for security (Logout All Devices)
    await revokeAllRefreshTokens(user._id, { session });
  });

  return { message: 'Password updated successfully. All other active sessions logged out.' };
};

/**
 * Verifies refresh tokens and generates new access tokens.
 * @param {string} refreshTokenString - Incoming refresh token cookie value.
 * @returns {Promise<Object>} - New signed access token.
 */
export const refreshAccessToken = async (refreshTokenString) => {
  // 1. Verify JWT Signature
  const decoded = verifyRefreshToken(refreshTokenString);
  
  // 2. Query matching active refresh token document and populate user details
  const tokenDoc = await findRefreshToken(refreshTokenString, { populateUser: true });
  if (!tokenDoc || tokenDoc.isRevoked || new Date(tokenDoc.expiresAt) < new Date()) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_EXPIRED);
  }

  const user = tokenDoc.userId; // Populated user model
  if (!user || user.isDeleted) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Authenticated user no longer exists.');
  }
  if (user.isBlocked) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Account is blocked. Session terminated.');
  }

  // 3. Generate New Access Token
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
  const accessToken = generateAccessToken(payload);

  return { accessToken };
};

/**
 * Logs out a user from the current device session.
 * @param {string} refreshTokenString - Incoming refresh token string.
 */
export const logoutUser = async (refreshTokenString) => {
  if (!refreshTokenString) return;
  // Mark individual token as revoked in database
  await revokeRefreshToken(refreshTokenString);
};

/**
 * Logs out a user from all devices (revokes all sessions).
 * @param {string} userId - Target user ID.
 */
export const logoutAllDevices = async (userId) => {
  await revokeAllRefreshTokens(userId);
};

/**
 * Updates user profile details (name, phoneNumber).
 * @param {string} userId - Target user ID.
 * @param {Object} updateData - Name and phone number fields.
 * @returns {Promise<Object>} - Updated user details payload.
 */
export const updateProfile = async (userId, updateData) => {
  const allowedUpdates = {};
  if (updateData.name) allowedUpdates.name = updateData.name;
  if (updateData.phoneNumber) allowedUpdates.phoneNumber = updateData.phoneNumber;

  const updatedUser = await updateUser(userId, allowedUpdates);
  if (!updatedUser) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'User account not found.');
  }

  return {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phoneNumber: updatedUser.phoneNumber,
    isVerified: updatedUser.isVerified,
  };
};

export default {
  registerUser,
  loginUser,
  loginWithGoogle,
  handleGoogleCallback,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  updateProfile,
};
