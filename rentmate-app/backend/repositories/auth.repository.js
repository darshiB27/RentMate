import User from '../models/userModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import logger from '../config/logger.js';

/**
 * Find a single User document by custom filter criteria.
 * @param {Object} filter - Query filter conditions.
 * @param {Object} options - Query settings: { select, session, lean }
 */
export const findOneUser = async (filter, { select = '', session = null, lean = false } = {}) => {
  try {
    let query = User.findOne(filter).session(session);
    if (select) query = query.select(select);
    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    logger.error(`Repository error in findOneUser: ${error.message}`);
    throw error;
  }
};

/**
 * Find User document by Email address.
 * @param {string} email - Target email.
 * @param {Object} options - Query settings: { select, session, lean }
 */
export const findUserByEmail = async (email, { select = '', session = null, lean = false } = {}) => {
  try {
    let query = User.findOne({ email }).session(session);
    if (select) query = query.select(select);
    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    logger.error(`Repository error in findUserByEmail: ${error.message}`);
    throw error;
  }
};

/**
 * Find User document by ObjectId ID.
 * @param {string} id - Target user ID.
 * @param {Object} options - Query settings: { select, session, lean }
 */
export const findUserById = async (id, { select = '', session = null, lean = true } = {}) => {
  try {
    let query = User.findById(id).session(session);
    if (select) query = query.select(select);
    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    logger.error(`Repository error in findUserById: ${error.message}`);
    throw error;
  }
};

/**
 * Find User document by Google social authentication profile ID.
 * @param {string} googleId - Target Google profile ID.
 * @param {Object} options - Query settings: { select, session, lean }
 */
export const findUserByGoogleId = async (googleId, { select = '', session = null, lean = true } = {}) => {
  try {
    let query = User.findOne({ googleId }).session(session);
    if (select) query = query.select(select);
    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    logger.error(`Repository error in findUserByGoogleId: ${error.message}`);
    throw error;
  }
};

/**
 * Creates and hashes new User registration records.
 * Note: New User instance is instantiated to trigger Mongoose pre('save') password hashing hooks.
 * @param {Object} userData - User registration attributes.
 * @param {Object} options - Query settings: { session }
 */
export const createUser = async (userData, { session = null } = {}) => {
  try {
    const user = new User(userData);
    await user.save({ session });
    return user;
  } catch (error) {
    logger.error(`Repository error in createUser: ${error.message}`);
    throw error;
  }
};

/**
 * Updates user records by target ID.
 * @param {string} id - Target user ID.
 * @param {Object} updateData - Key/value fields to update.
 * @param {Object} options - Query settings: { session, newDoc, lean }
 */
export const updateUser = async (id, updateData, { session = null, newDoc = true, lean = false } = {}) => {
  try {
    let query = User.findByIdAndUpdate(id, updateData, {
      new: newDoc,
      runValidators: true,
      session,
    });
    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    logger.error(`Repository error in updateUser: ${error.message}`);
    throw error;
  }
};

/**
 * Registers new active Refresh Token session structures.
 * @param {Object} tokenData - Refresh token attributes (userId, token, deviceInfo, expiresAt).
 * @param {Object} options - Query settings: { session }
 */
export const saveRefreshToken = async (tokenData, { session = null } = {}) => {
  try {
    const refreshToken = new RefreshToken(tokenData);
    await refreshToken.save({ session });
    return refreshToken;
  } catch (error) {
    logger.error(`Repository error in saveRefreshToken: ${error.message}`);
    throw error;
  }
};

/**
 * Finds a Refresh Token record. Optionally populates associated user info.
 * @param {string} token - Target token string.
 * @param {Object} options - Query settings: { populateUser, session, lean }
 */
export const findRefreshToken = async (token, { populateUser = false, session = null, lean = true } = {}) => {
  try {
    let query = RefreshToken.findOne({ token, isRevoked: false }).session(session);
    if (populateUser) query = query.populate('userId');
    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    logger.error(`Repository error in findRefreshToken: ${error.message}`);
    throw error;
  }
};

/**
 * Revokes an individual refresh token session (sets isRevoked = true).
 * @param {string} token - Target token string.
 * @param {Object} options - Query settings: { session }
 */
export const revokeRefreshToken = async (token, { session = null } = {}) => {
  try {
    return await RefreshToken.findOneAndUpdate(
      { token, isRevoked: false },
      { $set: { isRevoked: true } },
      { new: true, session }
    );
  } catch (error) {
    logger.error(`Repository error in revokeRefreshToken: ${error.message}`);
    throw error;
  }
};

/**
 * Revokes all refresh token sessions for a specific user ID (Logout All Devices).
 * @param {string} userId - Target user ID.
 * @param {Object} options - Query settings: { session }
 */
export const revokeAllRefreshTokens = async (userId, { session = null } = {}) => {
  try {
    return await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { $set: { isRevoked: true } },
      { session }
    );
  } catch (error) {
    logger.error(`Repository error in revokeAllRefreshTokens: ${error.message}`);
    throw error;
  }
};

/**
 * Explicitly removes all expired or previously revoked sessions.
 * @param {Object} options - Query settings: { session }
 */
export const deleteExpiredTokens = async ({ session = null } = {}) => {
  try {
    return await RefreshToken.deleteMany(
      {
        $or: [
          { expiresAt: { $lt: new Date() } },
          { isRevoked: true }
        ]
      },
      { session }
    );
  } catch (error) {
    logger.error(`Repository error in deleteExpiredTokens: ${error.message}`);
    throw error;
  }
};

/**
 * Updates the user's last Login timestamp.
 * @param {string} userId - Target user ID.
 * @param {Object} options - Query settings: { session }
 */
export const updateLastLogin = async (userId, { session = null } = {}) => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { lastLogin: new Date() } },
      { session }
    );
  } catch (error) {
    logger.error(`Repository error in updateLastLogin: ${error.message}`);
    throw error;
  }
};
