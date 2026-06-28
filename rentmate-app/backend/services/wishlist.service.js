import wishlistRepository from '../repositories/wishlist.repository.js';
import propertyRepository from '../repositories/property.repository.js';
import { findUserById } from '../repositories/auth.repository.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';

/**
 * Asserts that the authenticated user possesses the 'tenant' role.
 * 
 * @param {string} role - The user's role
 */
const assertIsTenant = (role) => {
  if (role !== 'tenant') {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      'Access denied. Only tenants are permitted to manage wishlists.'
    );
  }
};

/**
 * Asserts that a property listing exists, is approved, is available, and is not deleted.
 * 
 * @param {Object} property - Mongoose Property document or plain object
 */
const assertPropertyActive = (property) => {
  if (!property || property.isDeleted === true || property.verificationStatus !== 'approved' || property.availabilityStatus !== 'available') {
    throw new ApiError(
      STATUS_CODES.NOT_FOUND,
      'The requested property listing is either inactive, unavailable, or deleted.'
    );
  }
};

/**
 * Adds a property listing to a user's wishlist.
 * Enforces role restrictions, ownership limits, soft-deletion checks, and duplicate validation.
 * 
 * @param {string} userId - User identifier
 * @param {string} role - User role
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<Object>} - Created wishlist document details
 */
export const addToWishlist = async (userId, role, propertyId) => {
  assertIsTenant(role);

  // 1. Verify user exists and is active using User Repository (Auth Repository)
  const user = await findUserById(userId, { select: '+isBlocked +isDeleted' });
  if (!user || user.isDeleted || user.isBlocked) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'User session is inactive or invalid.');
  }

  // 2. Fetch the property to execute status check and ownership verification via Property Repository
  const property = await propertyRepository.findPropertyById(propertyId, { select: '+isDeleted' });
  assertPropertyActive(property);

  // 3. Owners cannot wishlist their own properties
  if (property.ownerId.toString() === userId.toString()) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      'Operation denied. Owners cannot wishlist their own property listings.'
    );
  }

  // 4. Prevent duplicate wishlist pairs using Wishlist Repository
  const existingItem = await wishlistRepository.findWishlist(userId, propertyId);
  if (existingItem) {
    throw new ApiError(
      STATUS_CODES.CONFLICT,
      'This property listing is already present in your wishlist.'
    );
  }

  const result = await wishlistRepository.createWishlist(userId, propertyId);
  await propertyRepository.updateProperty(propertyId, { $inc: { wishlistCount: 1 } });
  return result;
};

/**
 * Removes a property listing from a user's wishlist.
 * 
 * @param {string} userId - User identifier
 * @param {string} role - User role
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<Object>} - Deleted wishlist document details
 */
export const removeFromWishlist = async (userId, role, propertyId) => {
  assertIsTenant(role);

  const existingItem = await wishlistRepository.findWishlist(userId, propertyId);
  if (!existingItem) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'This wishlist item does not exist.');
  }

  const result = await wishlistRepository.deleteWishlist(userId, propertyId);
  await propertyRepository.updateProperty(propertyId, { $inc: { wishlistCount: -1 } });
  return result;
};

/**
 * Toggles a property listing in a user's wishlist.
 * 
 * @param {string} userId - User identifier
 * @param {string} role - User role
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<Object>} - Action state: toggled (true/false) and feedback message
 */
export const toggleWishlist = async (userId, role, propertyId) => {
  assertIsTenant(role);

  const existingItem = await wishlistRepository.findWishlist(userId, propertyId);

  if (existingItem) {
    await wishlistRepository.deleteWishlist(userId, propertyId);
    await propertyRepository.updateProperty(propertyId, { $inc: { wishlistCount: -1 } });
    return { toggled: false, message: 'Property removed from wishlist successfully.' };
  } else {
    // Run full validations before adding to wishlist
    const property = await propertyRepository.findPropertyById(propertyId, { select: '+isDeleted' });
    assertPropertyActive(property);

    if (property.ownerId.toString() === userId.toString()) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        'Operation denied. Owners cannot wishlist their own property listings.'
      );
    }

    await wishlistRepository.createWishlist(userId, propertyId);
    await propertyRepository.updateProperty(propertyId, { $inc: { wishlistCount: 1 } });
    return { toggled: true, message: 'Property added to wishlist successfully.' };
  }
};

/**
 * Fetches a tenant's paginated wishlist, filtering out listings deleted/hidden retrospectively.
 * 
 * @param {string} userId - User identifier
 * @param {string} role - User role
 * @param {number} page - Page number
 * @param {number} limit - Items limit
 * @returns {Promise<Object>} - Paginated wishlist data
 */
export const getUserWishlist = async (userId, role, page = 1, limit = 10) => {
  assertIsTenant(role);
  return await wishlistRepository.getUserWishlist(userId, page, limit);
};

/**
 * Checks if a specific property listing is wishlisted by the user.
 * 
 * @param {string} userId - User identifier
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<Object>} - Object with status flag
 */
export const checkIsWishlisted = async (userId, propertyId) => {
  const isWishlisted = await wishlistRepository.isPropertyWishlisted(userId, propertyId);
  return { isWishlisted };
};

/**
 * Gets the total count of wishlist references for a property listing.
 * 
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<Object>} - Object containing the wishlist count
 */
export const getPropertyWishlistCount = async (propertyId) => {
  const count = await wishlistRepository.getWishlistCount(propertyId);
  return { propertyId, count };
};

export default {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  getUserWishlist,
  checkIsWishlisted,
  getPropertyWishlistCount,
};
