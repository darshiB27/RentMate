import wishlistService from '../services/wishlist.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import STATUS_CODES from '../constants/statusCodes.js';

/**
 * Handles adding a property listing to a tenant's wishlist.
 * Expects propertyId in req.params.
 * Returns HTTP 201 Created on success.
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const result = await wishlistService.addToWishlist(req.user.id, req.user.role, propertyId);
  return res
    .status(STATUS_CODES.CREATED)
    .json(new ApiResponse(STATUS_CODES.CREATED, result, 'Property added to wishlist successfully.'));
});

/**
 * Handles removing a property listing from a tenant's wishlist.
 * Expects propertyId in req.params.
 * Returns HTTP 200 OK on success.
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const result = await wishlistService.removeFromWishlist(req.user.id, req.user.role, propertyId);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property removed from wishlist successfully.'));
});

/**
 * Handles toggling a property listing in a tenant's wishlist.
 * Expects propertyId in req.params.
 * Returns HTTP 200 OK on success.
 */
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const result = await wishlistService.toggleWishlist(req.user.id, req.user.role, propertyId);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, result.message));
});

/**
 * Handles fetching a tenant's paginated wishlist.
 * Returns HTTP 200 OK on success.
 */
export const getUserWishlist = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await wishlistService.getUserWishlist(req.user.id, req.user.role, page, limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'User wishlist fetched successfully.'));
});

/**
 * Handles checking if a property listing is wishlisted by the user.
 * Expects propertyId in req.params.
 * Returns HTTP 200 OK on success.
 */
export const checkIsWishlisted = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const result = await wishlistService.checkIsWishlisted(req.user.id, propertyId);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Wishlist status checked successfully.'));
});

/**
 * Handles counting the total wishlists referencing a property listing.
 * Expects propertyId in req.params.
 * Returns HTTP 200 OK on success.
 */
export const getPropertyWishlistCount = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const result = await wishlistService.getPropertyWishlistCount(propertyId);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Wishlist count fetched successfully.'));
});

export default {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  getUserWishlist,
  checkIsWishlisted,
  getPropertyWishlistCount,
};
