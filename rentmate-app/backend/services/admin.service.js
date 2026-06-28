import adminRepository from '../repositories/admin.repository.js';
import notificationService from './notification.service.js';
import analyticsService from './analytics.service.js';
import executeTransaction from '../utils/executeTransaction.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';
import logger from '../config/logger.js';

// ---------------------------------------------------------------------------
// GUARD HELPERS
// ---------------------------------------------------------------------------

/**
 * Asserts that a calling user possesses the admin role.
 * @param {string} role - Authenticated user role.
 */
const assertIsAdmin = (role) => {
  if (role !== 'admin') {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      'Access denied. Administrator privileges are required to perform this action.'
    );
  }
};

// ---------------------------------------------------------------------------
// USER MANAGEMENT
// ---------------------------------------------------------------------------

/**
 * Verifies a user as a platform property owner.
 * Promotes their role to 'owner', marks their account as verified, and dispatches
 * a verification notification.
 *
 * @param {string} adminId - Authenticated admin ID (for audit purposes).
 * @param {string} role - Admin role assertion.
 * @param {string} targetUserId - Target user to promote.
 * @returns {Promise<Object>} - Updated user document.
 */
export const verifyOwner = async (adminId, role, targetUserId) => {
  assertIsAdmin(role);

  // 1. Ensure target user exists and is not already an admin
  const user = await adminRepository.adminFindUserById(targetUserId, { lean: true });
  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Target user account not found.');
  }
  if (user.isDeleted) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Cannot verify a soft-deleted user account.');
  }
  if (user.role === 'admin') {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'This user is an administrator. Role promotion is not applicable.');
  }
  if (user.role === 'owner' && user.isVerified) {
    throw new ApiError(STATUS_CODES.CONFLICT, 'This user is already a verified owner.');
  }

  // 2. Execute role promotion inside a transaction
  const updatedUser = await executeTransaction(async (session) => {
    const promoted = await adminRepository.verifyUserAsOwner(targetUserId, session);

    // Dispatch system notification to the promoted user
    await notificationService.createNotification(
      targetUserId,
      'Account Verified as Owner',
      'Congratulations! Your account has been reviewed and verified as a Property Owner. You can now list properties on RentMate.',
      'verification',
      null,
      session
    );

    return promoted;
  });

  logger.info(`[Admin Service] Admin ${adminId} verified user ${targetUserId} as owner.`);
  return updatedUser;
};

/**
 * Blocks a user account, preventing login and all platform operations.
 *
 * @param {string} adminId - Authenticated admin ID.
 * @param {string} role - Admin role assertion.
 * @param {string} targetUserId - Target user to block.
 * @returns {Promise<Object>} - Updated user document.
 */
export const blockUser = async (adminId, role, targetUserId) => {
  assertIsAdmin(role);

  const user = await adminRepository.adminFindUserById(targetUserId, { lean: true });
  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Target user account not found.');
  }
  if (user.isDeleted) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'This account has already been deleted.');
  }
  if (user.role === 'admin') {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Administrators cannot block other administrators.');
  }
  if (user.isBlocked) {
    throw new ApiError(STATUS_CODES.CONFLICT, 'This user account is already blocked.');
  }

  const updatedUser = await adminRepository.blockUserById(targetUserId);

  logger.info(`[Admin Service] Admin ${adminId} blocked user ${targetUserId}.`);
  return updatedUser;
};

/**
 * Unblocks a previously blocked user account, restoring platform access.
 *
 * @param {string} adminId - Authenticated admin ID.
 * @param {string} role - Admin role assertion.
 * @param {string} targetUserId - Target user to unblock.
 * @returns {Promise<Object>} - Updated user document.
 */
export const unblockUser = async (adminId, role, targetUserId) => {
  assertIsAdmin(role);

  const user = await adminRepository.adminFindUserById(targetUserId, { lean: true });
  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Target user account not found.');
  }
  if (!user.isBlocked) {
    throw new ApiError(STATUS_CODES.CONFLICT, 'This user account is not currently blocked.');
  }

  const updatedUser = await adminRepository.unblockUserById(targetUserId);

  logger.info(`[Admin Service] Admin ${adminId} unblocked user ${targetUserId}.`);
  return updatedUser;
};

/**
 * Soft deletes a user account from the platform.
 * This action is irreversible via API. Dispatches a system notification before deletion.
 *
 * @param {string} adminId - Authenticated admin ID.
 * @param {string} role - Admin role assertion.
 * @param {string} targetUserId - Target user to soft delete.
 * @returns {Promise<Object>} - Confirmation details.
 */
export const softDeleteUser = async (adminId, role, targetUserId) => {
  assertIsAdmin(role);

  // Prevent admins from deleting themselves
  if (adminId.toString() === targetUserId.toString()) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Administrators cannot delete their own accounts via this endpoint.');
  }

  const user = await adminRepository.adminFindUserById(targetUserId, { lean: true });
  if (!user) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Target user account not found.');
  }
  if (user.isDeleted) {
    throw new ApiError(STATUS_CODES.CONFLICT, 'This user account has already been deleted.');
  }
  if (user.role === 'admin') {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Administrator accounts cannot be deleted via this endpoint.');
  }

  await adminRepository.softDeleteUserById(targetUserId);

  logger.info(`[Admin Service] Admin ${adminId} soft-deleted user ${targetUserId}.`);
  return { userId: targetUserId, deleted: true };
};

// ---------------------------------------------------------------------------
// PROPERTY MANAGEMENT
// ---------------------------------------------------------------------------

/**
 * Reviews a property listing and applies a verdict (approved or rejected).
 * Dispatches a property notification to the listing owner.
 *
 * @param {string} adminId - Authenticated admin ID.
 * @param {string} role - Admin role assertion.
 * @param {string} propertyId - Target property ID.
 * @param {string} verdict - 'approved' or 'rejected'.
 * @param {string} [reason] - Optional reason string attached to the notification.
 * @returns {Promise<Object>} - Updated property document.
 */
export const reviewListing = async (adminId, role, propertyId, verdict, reason = '') => {
  assertIsAdmin(role);

  const allowed = ['approved', 'rejected'];
  if (!allowed.includes(verdict)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, `Invalid verdict. Must be one of: ${allowed.join(', ')}.`);
  }

  const property = await adminRepository.adminFindPropertyById(propertyId);
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }
  if (property.isDeleted) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Cannot review a soft-deleted property listing.');
  }
  if (property.verificationStatus === verdict) {
    throw new ApiError(STATUS_CODES.CONFLICT, `This property is already marked as '${verdict}'.`);
  }

  const updatedProperty = await executeTransaction(async (session) => {
    const updated = await adminRepository.updatePropertyVerificationStatus(propertyId, verdict, session);

    const notifTitle = verdict === 'approved'
      ? 'Property Listing Approved'
      : 'Property Listing Rejected';

    const notifMessage = verdict === 'approved'
      ? `Your property listing "${property.title}" has been reviewed and approved. It is now visible to tenants.`
      : `Your property listing "${property.title}" was rejected.${reason ? ` Reason: ${reason}` : ' Please review and resubmit.'}`;

    await notificationService.createNotification(
      property.ownerId._id || property.ownerId,
      notifTitle,
      notifMessage,
      'property',
      propertyId,
      session
    );

    return updated;
  });

  logger.info(`[Admin Service] Admin ${adminId} set property ${propertyId} verification to '${verdict}'.`);
  return updatedProperty;
};

/**
 * Convenience wrapper: Approves a property listing.
 * @param {string} adminId
 * @param {string} role
 * @param {string} propertyId
 * @returns {Promise<Object>}
 */
export const approveProperty = async (adminId, role, propertyId) => {
  return reviewListing(adminId, role, propertyId, 'approved');
};

/**
 * Convenience wrapper: Rejects a property listing with an optional reason.
 * @param {string} adminId
 * @param {string} role
 * @param {string} propertyId
 * @param {string} [reason]
 * @returns {Promise<Object>}
 */
export const rejectProperty = async (adminId, role, propertyId, reason = '') => {
  return reviewListing(adminId, role, propertyId, 'rejected', reason);
};

/**
 * Soft deletes a property listing from the platform.
 * Dispatches a system notification to the owner.
 *
 * @param {string} adminId - Authenticated admin ID.
 * @param {string} role - Admin role assertion.
 * @param {string} propertyId - Target property ID.
 * @returns {Promise<Object>} - Confirmation details.
 */
export const softDeleteProperty = async (adminId, role, propertyId) => {
  assertIsAdmin(role);

  const property = await adminRepository.adminFindPropertyById(propertyId);
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }
  if (property.isDeleted) {
    throw new ApiError(STATUS_CODES.CONFLICT, 'This property listing has already been deleted.');
  }

  await executeTransaction(async (session) => {
    await adminRepository.softDeletePropertyById(propertyId, session);

    await notificationService.createNotification(
      property.ownerId._id || property.ownerId,
      'Property Listing Removed',
      `Your property listing "${property.title}" has been removed from the platform by an administrator.`,
      'property',
      propertyId,
      session
    );
  });

  logger.info(`[Admin Service] Admin ${adminId} soft-deleted property ${propertyId}.`);
  return { propertyId, deleted: true };
};

// ---------------------------------------------------------------------------
// DASHBOARD STATISTICS
// ---------------------------------------------------------------------------

/**
 * Retrieves aggregated platform KPIs for the admin dashboard.
 * Combines real-time counts and analytics service metrics.
 *
 * @param {string} adminId - Authenticated admin ID.
 * @param {string} role - Admin role assertion.
 * @param {string} [startDate] - Optional analytics start date.
 * @param {string} [endDate] - Optional analytics end date.
 * @returns {Promise<Object>} - Comprehensive dashboard data object.
 */
export const getDashboardStats = async (adminId, role, startDate, endDate) => {
  assertIsAdmin(role);

  try {
    // Run platform counts and analytics aggregations in parallel
    const [platformStats, analyticsData, topListings] = await Promise.all([
      adminRepository.getPlatformDashboardStats(),
      analyticsService.getAdminDashboard(role, startDate, endDate),
      analyticsService.getTopListings(5),
    ]);

    return {
      platform: platformStats,
      analytics: analyticsData,
      topListings,
    };
  } catch (error) {
    logger.error(`[Admin Service] Error in getDashboardStats: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves platform users.
 * @param {string} role - Calling user role.
 * @param {Object} query - Query parameters.
 * @returns {Promise<Object>} - Users and pagination details.
 */
export const getUsers = async (role, query = {}) => {
  assertIsAdmin(role);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: { $ne: true } };
  if (query.role) filter.role = query.role;
  if (query.isBlocked !== undefined && query.isBlocked !== '') {
    filter.isBlocked = query.isBlocked === 'true';
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const { users, total } = await adminRepository.adminGetUsers(filter, skip, limit);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Retrieves platform properties.
 * @param {string} role - Calling user role.
 * @param {Object} query - Query parameters.
 * @returns {Promise<Object>} - Properties and pagination details.
 */
export const getProperties = async (role, query = {}) => {
  assertIsAdmin(role);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: { $ne: true } };
  if (query.verificationStatus) filter.verificationStatus = query.verificationStatus;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
    ];
  }

  const { properties, total } = await adminRepository.adminGetProperties(filter, skip, limit);

  return {
    properties,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export default {
  verifyOwner,
  blockUser,
  unblockUser,
  softDeleteUser,
  reviewListing,
  approveProperty,
  rejectProperty,
  softDeleteProperty,
  getDashboardStats,
  getUsers,
  getProperties,
};
