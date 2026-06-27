import User from '../models/userModel.js';
import Property from '../models/property.model.js';
import Inquiry from '../models/inquiry.model.js';
import Notification from '../models/notification.model.js';
import executeTransaction from '../utils/executeTransaction.js';
import logger from '../config/logger.js';


// ---------------------------------------------------------------------------
// USER OPERATIONS
// ---------------------------------------------------------------------------

/**
 * Retrieves a user document with hidden fields exposed for admin inspection.
 * @param {string} userId - Target user ID.
 * @param {Object} options - { session, lean }
 * @returns {Promise<Object|null>}
 */
export const adminFindUserById = async (userId, { session = null, lean = true } = {}) => {
  try {
    let query = User.findById(userId)
      .select('+isBlocked +isDeleted +passwordChangedAt')
      .session(session);
    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    logger.error(`[Admin Repository] Error in adminFindUserById: ${error.message}`);
    throw error;
  }
};

/**
 * Verifies a user as a platform owner by setting role to 'owner' and flagging as verified.
 * Supports transactional sessions.
 * @param {string} userId - Target user ID.
 * @param {Object} session - Mongoose session.
 * @returns {Promise<Object|null>}
 */
export const verifyUserAsOwner = async (userId, session = null) => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { role: 'owner', isVerified: true } },
      { new: true, runValidators: true, session }
    );
  } catch (error) {
    logger.error(`[Admin Repository] Error in verifyUserAsOwner: ${error.message}`);
    throw error;
  }
};

/**
 * Blocks a user account.
 * @param {string} userId - Target user ID.
 * @param {Object} session - Mongoose session.
 * @returns {Promise<Object|null>}
 */
export const blockUserById = async (userId, session = null) => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { isBlocked: true } },
      { new: true, session }
    );
  } catch (error) {
    logger.error(`[Admin Repository] Error in blockUserById: ${error.message}`);
    throw error;
  }
};

/**
 * Unblocks a user account.
 * @param {string} userId - Target user ID.
 * @param {Object} session - Mongoose session.
 * @returns {Promise<Object|null>}
 */
export const unblockUserById = async (userId, session = null) => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { isBlocked: false } },
      { new: true, session }
    );
  } catch (error) {
    logger.error(`[Admin Repository] Error in unblockUserById: ${error.message}`);
    throw error;
  }
};

/**
 * Soft deletes a user by setting isDeleted to true.
 * @param {string} userId - Target user ID.
 * @param {Object} session - Mongoose session.
 * @returns {Promise<Object|null>}
 */
export const softDeleteUserById = async (userId, session = null) => {
  try {
    // Must bypass the pre-find soft-delete exclusion middleware using findOneAndUpdate directly
    return await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isDeleted: true } },
      { new: true, session }
    );
  } catch (error) {
    logger.error(`[Admin Repository] Error in softDeleteUserById: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves a paginated user list for admin management with hidden fields exposed.
 * @param {Object} filter - Query filter object.
 * @param {number} skip - Offset.
 * @param {number} limit - Page size.
 * @returns {Promise<Object>} - { users, total }
 */
export const adminGetUsers = async (filter = {}, skip = 0, limit = 20) => {
  try {
    const users = await User.find(filter)
      .select('+isBlocked +isDeleted')
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 })
      .lean();

    const total = await User.countDocuments(filter);
    return { users, total };
  } catch (error) {
    logger.error(`[Admin Repository] Error in adminGetUsers: ${error.message}`);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// PROPERTY OPERATIONS
// ---------------------------------------------------------------------------

/**
 * Updates a property's verificationStatus for admin review operations.
 * @param {string} propertyId - Target property ID.
 * @param {string} status - New verification status: 'approved' | 'rejected'.
 * @param {Object} session - Mongoose session.
 * @returns {Promise<Object|null>}
 */
export const updatePropertyVerificationStatus = async (propertyId, status, session = null) => {
  try {
    return await Property.findByIdAndUpdate(
      propertyId,
      { $set: { verificationStatus: status } },
      { new: true, runValidators: true, session }
    );
  } catch (error) {
    logger.error(`[Admin Repository] Error in updatePropertyVerificationStatus: ${error.message}`);
    throw error;
  }
};

/**
 * Soft deletes a property listing by setting isDeleted to true.
 * Bypasses the pre-find soft-delete middleware using findOneAndUpdate.
 * @param {string} propertyId - Target property ID.
 * @param {Object} session - Mongoose session.
 * @returns {Promise<Object|null>}
 */
export const softDeletePropertyById = async (propertyId, session = null) => {
  try {
    return await Property.findOneAndUpdate(
      { _id: propertyId },
      { $set: { isDeleted: true } },
      { new: true, session }
    );
  } catch (error) {
    logger.error(`[Admin Repository] Error in softDeletePropertyById: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves a single property document with hidden isDeleted field exposed.
 * @param {string} propertyId - Target property ID.
 * @returns {Promise<Object|null>}
 */
export const adminFindPropertyById = async (propertyId) => {
  try {
    return await Property.findOne({ _id: propertyId })
      .select('+isDeleted')
      .populate({ path: 'ownerId', select: 'name email role' })
      .lean();
  } catch (error) {
    logger.error(`[Admin Repository] Error in adminFindPropertyById: ${error.message}`);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// DASHBOARD STATISTICS
// ---------------------------------------------------------------------------

/**
 * Compiles real-time platform-wide dashboard KPI counts.
 * Uses countDocuments for fast index-level counts.
 * @returns {Promise<Object>} - Platform-wide KPI statistics snapshot.
 */
export const getPlatformDashboardStats = async () => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalTenants,
      blockedUsers,
      totalProperties,
      pendingProperties,
      approvedProperties,
      rejectedProperties,
      totalInquiries,
      pendingInquiries,
      totalNotifications,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'tenant' }),
      User.countDocuments({ isBlocked: true }),
      Property.countDocuments({}),
      Property.countDocuments({ verificationStatus: 'pending' }),
      Property.countDocuments({ verificationStatus: 'approved' }),
      Property.countDocuments({ verificationStatus: 'rejected' }),
      Inquiry.countDocuments({}),
      Inquiry.countDocuments({ status: 'pending' }),
      Notification.countDocuments({}),
    ]);

    return {
      users: {
        total: totalUsers,
        owners: totalOwners,
        tenants: totalTenants,
        blocked: blockedUsers,
      },
      properties: {
        total: totalProperties,
        pending: pendingProperties,
        approved: approvedProperties,
        rejected: rejectedProperties,
      },
      inquiries: {
        total: totalInquiries,
        pending: pendingInquiries,
      },
      notifications: {
        total: totalNotifications,
      },
    };
  } catch (error) {
    logger.error(`[Admin Repository] Error in getPlatformDashboardStats: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves a paginated properties list for admin management.
 * @param {Object} filter - Query filter object.
 * @param {number} skip - Offset.
 * @param {number} limit - Page size.
 * @returns {Promise<Object>} - { properties, total }
 */
export const adminGetProperties = async (filter = {}, skip = 0, limit = 20) => {
  try {
    const properties = await Property.find(filter)
      .populate({ path: 'ownerId', select: 'name email role' })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Property.countDocuments(filter);
    return { properties, total };
  } catch (error) {
    logger.error(`[Admin Repository] Error in adminGetProperties: ${error.message}`);
    throw error;
  }
};

export { executeTransaction };

export default {
  adminFindUserById,
  verifyUserAsOwner,
  blockUserById,
  unblockUserById,
  softDeleteUserById,
  adminGetUsers,
  updatePropertyVerificationStatus,
  softDeletePropertyById,
  adminFindPropertyById,
  getPlatformDashboardStats,
  adminGetProperties,
};
