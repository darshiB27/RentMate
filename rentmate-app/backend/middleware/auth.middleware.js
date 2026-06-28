import { verifyAccessToken } from '../utils/tokenUtils.js';
import { findUserById } from '../repositories/auth.repository.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';

/**
 * Enforces valid JWT Session Access Tokens.
 * Extracts, decodes, checks user account statuses (blocked, soft-deleted), 
 * and verifies password modification timing.
 */
export const verifyJWT = async (req, res, next) => {
  try {
    let token = '';

    // 1. Extract token from Auth Header or cookies
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Access denied. Authentication token is missing.');
    }

    // 2. Decode and verify signature
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtError) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid or expired access token.');
    }

    // 3. Fetch User and check account active status
    // Select passwordChangedAt to verify token issued-at timing checks
    const user = await findUserById(decoded.id, {
      select: '+isBlocked +isDeleted +passwordChangedAt',
      lean: false, // Must be true Mongoose document to use isPasswordChangedAfter instance method
    });

    if (!user) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'The user session associated with this token no longer exists.');
    }

    if (user.isDeleted) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'This account has been deleted.');
    }

    if (user.isBlocked) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, 'This user account is blocked by administrative settings.');
    }

    // 4. Verify password was not changed after token was issued
    if (user.isPasswordChangedAfter && user.isPasswordChangedAfter(decoded.iat)) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'User recently changed password. Please authenticate again.');
    }

    // 5. Attach User context to Request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication gate.
 * Resolves user context if a valid token is found, but does not block request if missing or invalid.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = '';

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(); // Continue silently
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await findUserById(decoded.id, {
        select: '+isBlocked +isDeleted +passwordChangedAt',
        lean: false,
      });

      // Verify account is active and password hasn't been changed since token issuance
      if (user && !user.isDeleted && !user.isBlocked && !user.isPasswordChangedAfter(decoded.iat)) {
        req.user = user;
      }
    } catch (ignore) {
      // Fail silently for optional authentication checks
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  verifyJWT,
  optionalAuth,
};
