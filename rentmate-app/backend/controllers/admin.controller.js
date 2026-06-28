import adminService from '../services/admin.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import STATUS_CODES from '../constants/statusCodes.js';

// ---------------------------------------------------------------------------
// USER MANAGEMENT CONTROLLERS
// ---------------------------------------------------------------------------

/**
 * @route PATCH /api/v1/admin/users/:id/verify-owner
 * @desc Promote a tenant user to verified owner status.
 * @access Admin Only
 */
export const verifyOwner = asyncHandler(async (req, res) => {
  const result = await adminService.verifyOwner(
    req.user.id,
    req.user.role,
    req.params.id
  );
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'User has been successfully verified as a property owner.'));
});

/**
 * @route PATCH /api/v1/admin/users/:id/block
 * @desc Block a user account, preventing all platform access.
 * @access Admin Only
 */
export const blockUser = asyncHandler(async (req, res) => {
  const result = await adminService.blockUser(
    req.user.id,
    req.user.role,
    req.params.id
  );
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'User account blocked successfully.'));
});

/**
 * @route PATCH /api/v1/admin/users/:id/unblock
 * @desc Restore access to a previously blocked user account.
 * @access Admin Only
 */
export const unblockUser = asyncHandler(async (req, res) => {
  const result = await adminService.unblockUser(
    req.user.id,
    req.user.role,
    req.params.id
  );
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'User account unblocked successfully.'));
});

/**
 * @route DELETE /api/v1/admin/users/:id
 * @desc Soft delete a user account from the platform.
 * @access Admin Only
 */
export const softDeleteUser = asyncHandler(async (req, res) => {
  const result = await adminService.softDeleteUser(
    req.user.id,
    req.user.role,
    req.params.id
  );
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'User account has been removed from the platform.'));
});

// ---------------------------------------------------------------------------
// PROPERTY MANAGEMENT CONTROLLERS
// ---------------------------------------------------------------------------

/**
 * @route PATCH /api/v1/admin/properties/:id/review
 * @desc Review a property listing and apply an approved or rejected verdict.
 * @access Admin Only
 * Body: { verdict: 'approved' | 'rejected', reason?: string }
 */
export const reviewListing = asyncHandler(async (req, res) => {
  const { verdict, reason } = req.body;
  const result = await adminService.reviewListing(
    req.user.id,
    req.user.role,
    req.params.id,
    verdict,
    reason
  );
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, `Property listing ${verdict} successfully.`));
});

/**
 * @route PATCH /api/v1/admin/properties/:id/approve
 * @desc Approve a property listing and make it publicly visible.
 * @access Admin Only
 */
export const approveProperty = asyncHandler(async (req, res) => {
  const result = await adminService.approveProperty(
    req.user.id,
    req.user.role,
    req.params.id
  );
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property listing approved successfully.'));
});

/**
 * @route PATCH /api/v1/admin/properties/:id/reject
 * @desc Reject a property listing with an optional reason.
 * @access Admin Only
 * Body: { reason?: string }
 */
export const rejectProperty = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const result = await adminService.rejectProperty(
    req.user.id,
    req.user.role,
    req.params.id,
    reason
  );
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property listing rejected successfully.'));
});

/**
 * @route DELETE /api/v1/admin/properties/:id
 * @desc Soft delete a property listing from the platform.
 * @access Admin Only
 */
export const softDeleteProperty = asyncHandler(async (req, res) => {
  const result = await adminService.softDeleteProperty(
    req.user.id,
    req.user.role,
    req.params.id
  );
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property listing has been removed from the platform.'));
});

// ---------------------------------------------------------------------------
// DASHBOARD STATISTICS
// ---------------------------------------------------------------------------

/**
 * @route GET /api/v1/admin/dashboard
 * @desc Retrieve comprehensive platform KPI statistics for the admin dashboard.
 * @access Admin Only
 * Query: { startDate?, endDate? }
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminService.getDashboardStats(
    req.user.id,
    req.user.role,
    startDate,
    endDate
  );
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Admin dashboard statistics retrieved successfully.'));
});

/**
 * Handles fetching platform users for admin management.
 */
export const getUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getUsers(req.user.role, req.query);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Users list retrieved successfully.'));
});

/**
 * Handles fetching platform properties for admin management.
 */
export const getProperties = asyncHandler(async (req, res) => {
  const result = await adminService.getProperties(req.user.role, req.query);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Properties list retrieved successfully.'));
});

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
