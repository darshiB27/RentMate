// Admin-only Operations Router
// Security: All routes require a valid JWT and admin role.
import express from 'express';
import {
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
} from '../controllers/admin.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

// --- Global Admin Security Guards ---
// All routes mounted on this router require:
//   1. A valid, signed JWT (verifyJWT)
//   2. The authenticated user to have role === 'admin' (authorizeRoles)
router.use(verifyJWT);
router.use(authorizeRoles('admin'));

// ---------------------------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------------------------

/**
 * @route GET /api/v1/admin/dashboard
 * @desc Platform-wide KPI statistics dashboard.
 * @access Admin Only
 * @query startDate, endDate (optional ISO date strings)
 */
router.get('/dashboard', getDashboardStats);

// ---------------------------------------------------------------------------
// USER MANAGEMENT
// ---------------------------------------------------------------------------

/**
 * @route GET /api/v1/admin/users
 * @desc Retrieve platform users with search/filters.
 * @access Admin Only
 */
router.get('/users', getUsers);

/**
 * @route PATCH /api/v1/admin/users/:id/verify-owner
 * @desc Promote a tenant to verified owner status.
 * @access Admin Only
 */
router.patch('/users/:id/verify-owner', verifyOwner);

/**
 * @route PATCH /api/v1/admin/users/:id/block
 * @desc Block a user account.
 * @access Admin Only
 */
router.patch('/users/:id/block', blockUser);

/**
 * @route PATCH /api/v1/admin/users/:id/unblock
 * @desc Unblock a previously blocked user account.
 * @access Admin Only
 */
router.patch('/users/:id/unblock', unblockUser);

/**
 * @route DELETE /api/v1/admin/users/:id
 * @desc Soft delete a user account from the platform.
 * @access Admin Only
 */
router.delete('/users/:id', softDeleteUser);

// ---------------------------------------------------------------------------
// PROPERTY MANAGEMENT
// ---------------------------------------------------------------------------

/**
 * @route GET /api/v1/admin/properties
 * @desc Retrieve platform properties with search/filters.
 * @access Admin Only
 */
router.get('/properties', getProperties);

/**
 * @route PATCH /api/v1/admin/properties/:id/review
 * @desc Review a listing – submit { verdict: 'approved'|'rejected', reason?: string }.
 * @access Admin Only
 */
router.patch('/properties/:id/review', reviewListing);

/**
 * @route PATCH /api/v1/admin/properties/:id/approve
 * @desc Approve a property listing.
 * @access Admin Only
 */
router.patch('/properties/:id/approve', approveProperty);

/**
 * @route PATCH /api/v1/admin/properties/:id/reject
 * @desc Reject a property listing – body may include { reason?: string }.
 * @access Admin Only
 */
router.patch('/properties/:id/reject', rejectProperty);

/**
 * @route DELETE /api/v1/admin/properties/:id
 * @desc Soft delete a property listing from the platform.
 * @access Admin Only
 */
router.delete('/properties/:id', softDeleteProperty);

export default router;
