import analyticsService from '../services/analytics.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import STATUS_CODES from '../constants/statusCodes.js';

/**
 * Handles tracking a raw property view.
 * Binds optionally authenticated users and parses client IP context.
 */
export const trackPropertyView = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const viewerId = req.user?.id || null;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  await analyticsService.trackView(propertyId, viewerId, clientIp);

  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, { tracked: true }, 'Property view hit recorded.'));
});

/**
 * Handles fetching dashboard stats for the authenticated Owner.
 */
export const getOwnerStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await analyticsService.getOwnerDashboard(req.user.id, req.user.role, startDate, endDate);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Owner dashboard analytics fetched successfully.'));
});

/**
 * Handles fetching dashboard stats for the authenticated Admin.
 */
export const getAdminStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await analyticsService.getAdminDashboard(req.user.role, startDate, endDate);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Admin dashboard analytics fetched successfully.'));
});

/**
 * Handles fetching top-performing listings, localities, and cities.
 */
export const getTopListings = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const result = await analyticsService.getTopListings(limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Top lists fetched successfully.'));
});

export default {
  trackPropertyView,
  getOwnerStats,
  getAdminStats,
  getTopListings,
};
