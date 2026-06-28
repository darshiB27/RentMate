import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../config/logger.js';

/**
 * Signs a short-lived Access Token.
 * @param {Object} payload - User properties payload (id, email, role, isVerified).
 * @returns {string} - Signed JWT access token.
 */
export const generateAccessToken = (payload) => {
  try {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    });
  } catch (error) {
    logger.error('Error generating Access Token:', error);
    throw error;
  }
};

/**
 * Signs a long-lived Refresh Token.
 * @param {Object} payload - User payload containing ID to verify session.
 * @returns {string} - Signed JWT refresh token.
 */
export const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY,
    });
  } catch (error) {
    logger.error('Error generating Refresh Token:', error);
    throw error;
  }
};

/**
 * Decodes and verifies a JWT Access Token.
 * @param {string} token - Signed token string.
 * @returns {Object} - Decoded payload parameters.
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (error) {
    logger.debug(`Access token verification failed: ${error.message}`);
    throw error;
  }
};

/**
 * Decodes and verifies a JWT Refresh Token.
 * @param {string} token - Signed token string.
 * @returns {Object} - Decoded payload parameters.
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (error) {
    logger.debug(`Refresh token verification failed: ${error.message}`);
    throw error;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
