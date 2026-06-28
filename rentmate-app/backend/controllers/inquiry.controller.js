import inquiryService from '../services/inquiry.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import STATUS_CODES from '../constants/statusCodes.js';

/**
 * Handles creation of a property inquiry by a tenant.
 */
export const createInquiry = asyncHandler(async (req, res) => {
  const result = await inquiryService.createInquiry(req.user.id, req.user.role, req.body);
  return res
    .status(STATUS_CODES.CREATED)
    .json(new ApiResponse(STATUS_CODES.CREATED, result, 'Inquiry submitted successfully.'));
});

/**
 * Handles fetching inquiries for the logged-in user.
 * Routes dynamically based on user role (tenant gets inquiries they made, owner gets inquiries they received).
 */
export const getMyInquiries = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  let result;
  if (req.user.role === 'tenant') {
    result = await inquiryService.getTenantInquiries(req.user.id, req.user.role, page, limit);
  } else {
    result = await inquiryService.getOwnerInquiries(req.user.id, req.user.role, page, limit);
  }
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'My inquiries fetched successfully.'));
});

/**
 * Handles fetching inquiries received for a specific property.
 * Owner only.
 */
export const getPropertyInquiries = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const { page, limit } = req.query;
  const result = await inquiryService.getPropertyInquiries(req.user.id, req.user.role, propertyId, page, limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Property inquiries fetched successfully.'));
});

/**
 * Handles fetching detail metrics for an inquiry by ID.
 * Access restricted to target tenant, owner, or admin.
 */
export const getInquiryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await inquiryService.getInquiryById(req.user.id, req.user.role, id);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Inquiry details fetched successfully.'));
});

/**
 * Handles updating an inquiry's status directly.
 */
export const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const result = await inquiryService.updateInquiryStatus(req.user.id, req.user.role, id, status, notes);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Inquiry status updated successfully.'));
});

/**
 * Handles scheduling a property visit.
 * Owner only.
 */
export const scheduleVisit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { visitDate, notes } = req.body;
  const result = await inquiryService.scheduleVisit(req.user.id, req.user.role, id, visitDate, notes);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Visit scheduled successfully.'));
});

/**
 * Handles owner accepting an inquiry.
 */
export const acceptInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const result = await inquiryService.acceptInquiry(req.user.id, req.user.role, id, notes);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Inquiry accepted successfully.'));
});

/**
 * Handles owner rejecting an inquiry.
 */
export const rejectInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const result = await inquiryService.rejectInquiry(req.user.id, req.user.role, id, notes);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Inquiry rejected successfully.'));
});

/**
 * Handles tenant cancelling their inquiry.
 */
export const cancelInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const result = await inquiryService.cancelInquiry(req.user.id, req.user.role, id, notes);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Inquiry cancelled successfully.'));
});

/**
 * Handles fetching dashboard statistics summary metrics of all inquiries received.
 * Owner only.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const result = await inquiryService.getOwnerDashboardStats(req.user.id, req.user.role);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Dashboard statistics fetched successfully.'));
});

export default {
  createInquiry,
  getMyInquiries,
  getPropertyInquiries,
  getInquiryById,
  updateInquiryStatus,
  scheduleVisit,
  acceptInquiry,
  rejectInquiry,
  cancelInquiry,
  getDashboardStats,
};
