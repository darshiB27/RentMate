import propertyService from '../services/property.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import STATUS_CODES from '../constants/statusCodes.js';

/**
 * Handles creation of a new property listing.
 */
export const createProperty = asyncHandler(async (req, res) => {
  const result = await propertyService.createProperty(req.user.id, req.user.role, req.body, req.files);
  return res
    .status(STATUS_CODES.CREATED)
    .json(new ApiResponse(STATUS_CODES.CREATED, result, 'Property listing created successfully.'));
});

/**
 * Handles fetching listing details by its Object ID.
 */
export const getPropertyById = asyncHandler(async (req, res) => {
  const result = await propertyService.getPropertyById(req.params.id);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property details fetched successfully.'));
});

/**
 * Handles fetching listing details by its slug identifier.
 */
export const getPropertyBySlug = asyncHandler(async (req, res) => {
  const result = await propertyService.getPropertyBySlug(req.params.slug);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property details fetched successfully.'));
});

/**
 * Handles updating an existing listing.
 */
export const updateProperty = asyncHandler(async (req, res) => {
  const result = await propertyService.updateProperty(req.user.id, req.user.role, req.params.id, req.body, req.files);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property listing updated successfully.'));
});

/**
 * Handles soft-deleting a listing.
 */
export const deleteProperty = asyncHandler(async (req, res) => {
  const result = await propertyService.deleteProperty(req.user.id, req.user.role, req.params.id);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property listing deleted successfully.'));
});

/**
 * Handles fetching property listings owned by current user.
 */
export const getOwnerProperties = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await propertyService.getOwnerProperties(req.user.id, req.user.role, page, limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Owner properties fetched successfully.'));
});

/**
 * Handles fetching featured listings.
 */
export const getFeaturedProperties = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await propertyService.getFeaturedProperties(page, limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Featured properties fetched successfully.'));
});

/**
 * Handles fetching trending listings.
 */
export const getTrendingProperties = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await propertyService.getTrendingProperties(page, limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Trending properties fetched successfully.'));
});

/**
 * Handles proximity geospatial search queries.
 */
export const getNearbyProperties = asyncHandler(async (req, res) => {
  const { longitude, latitude, maxDistance, page, limit } = req.query;
  const result = await propertyService.getNearbyProperties(longitude, latitude, maxDistance, page, limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Nearby properties fetched successfully.'));
});

/**
 * Handles updating availability status.
 */
export const updateAvailabilityStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { availabilityStatus } = req.body;
  const result = await propertyService.updateAvailabilityStatus(req.user.id, req.user.role, id, availabilityStatus);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Availability status updated successfully.'));
});

/**
 * Handles admin approving a property listing.
 */
export const approveProperty = asyncHandler(async (req, res) => {
  const result = await propertyService.approveProperty(req.user.id, req.user.role, req.params.id);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property approved successfully.'));
});

/**
 * Handles admin rejecting a property listing.
 */
export const rejectProperty = asyncHandler(async (req, res) => {
  const result = await propertyService.rejectProperty(req.user.id, req.user.role, req.params.id);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property rejected successfully.'));
});

export default {
  createProperty,
  getPropertyById,
  getPropertyBySlug,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
  getFeaturedProperties,
  getTrendingProperties,
  getNearbyProperties,
  updateAvailabilityStatus,
  approveProperty,
  rejectProperty,
};
