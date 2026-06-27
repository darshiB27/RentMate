import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';

// --- SYSTEM ROLE-BASED PERMISSIONS CONFIGURATION ---
export const ROLE_PERMISSIONS = {
  tenant: [
    'view_properties',
    'create_inquiries',
    'manage_wishlist'
  ],
  owner: [
    'view_properties',
    'create_properties',
    'manage_properties',
    'view_analytics',
    'respond_inquiries'
  ],
  admin: [
    'view_properties',
    'create_properties',
    'manage_properties',
    'view_analytics',
    'respond_inquiries',
    'verify_owners',
    'approve_listings',
    'manage_users',
    'view_logs'
  ]
};

/**
 * Enforces Role-Based Access Control (RBAC).
 * Blocks users whose roles are not present in the allowed list.
 * @param {...string} allowedRoles - List of authorized roles (e.g. 'owner', 'admin').
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, 'Session context is missing. Authentication is required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          STATUS_CODES.FORBIDDEN,
          `Forbidden access. Your account role (${req.user.role}) is unauthorized to perform this action.`
        )
      );
    }

    next();
  };
};

/**
 * Enforces Permission-Based Access Control.
 * Blocks users who do not possess all required permissions.
 * @param {...string} requiredPermissions - List of semantic permissions required (e.g. 'approve_listings').
 */
export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, 'Session context is missing. Authentication is required.'));
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    // Ensure user possesses all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return next(
        new ApiError(
          STATUS_CODES.FORBIDDEN,
          'Access denied. You do not possess the required permissions to execute this action.'
        )
      );
    }

    next();
  };
};

export default {
  authorizeRoles,
  authorizePermissions,
};
