import express from 'express';
import {
  trackPropertyView,
  getOwnerStats,
  getAdminStats,
  getTopListings,
} from '../controllers/analytics.controller.js';
import { verifyJWT, optionalAuth } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateQuery, validateParams } from '../middleware/validateMiddleware.js';
import {
  dashboardQuerySchema,
  propertyParamsSchema,
} from '../validators/analytics.validator.js';

const router = express.Router();

/**
 * @route POST /api/v1/analytics/view/:propertyId
 * @desc Track a property view hit. Guest and authenticated sessions supported.
 * @access Public / Optional Authentication
 */
router.post(
  '/view/:propertyId',
  optionalAuth,
  validateParams(propertyParamsSchema),
  trackPropertyView
);

/**
 * @route GET /api/v1/analytics/top
 * @desc Fetch top-performing listings, localities, and cities.
 * @access Public
 */
router.get('/top', validateQuery(dashboardQuerySchema), getTopListings);

/**
 * @route GET /api/v1/analytics/owner
 * @desc Fetch statistics dashboard for authenticated Owner properties.
 * @access Owner Only
 */
router.get(
  '/owner',
  verifyJWT,
  authorizeRoles('owner'),
  validateQuery(dashboardQuerySchema),
  getOwnerStats
);

/**
 * @route GET /api/v1/analytics/admin
 * @desc Fetch statistics dashboard globally across platform.
 * @access Admin Only
 */
router.get(
  '/admin',
  verifyJWT,
  authorizeRoles('admin'),
  validateQuery(dashboardQuerySchema),
  getAdminStats
);

export default router;
