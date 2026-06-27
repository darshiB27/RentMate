import express from 'express';
import {
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
} from '../controllers/property.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';
import {
  validateSchema,
  validateQuery,
  validateParams,
} from '../middleware/validateMiddleware.js';
import {
  createPropertySchema,
  updatePropertySchema,
  updateAvailabilitySchema,
  nearbyQuerySchema,
  propertyQuerySchema,
  propertyParamsSchema,
} from '../validators/property.validator.js';

const router = express.Router();

/**
 * @route POST /api/v1/properties
 * @desc Create a new property listing.
 * @access Owner or Admin
 */
router.post(
  '/',
  verifyJWT,
  authorizeRoles('owner', 'admin'),
  uploadMultiple,
  validateSchema(createPropertySchema),
  createProperty
);

/**
 * @route GET /api/v1/properties/me
 * @desc Retrieve properties owned by the current logged-in user.
 * @access Owner or Admin
 */
router.get(
  '/me',
  verifyJWT,
  authorizeRoles('owner', 'admin'),
  validateQuery(propertyQuerySchema),
  getOwnerProperties
);

/**
 * @route GET /api/v1/properties/featured
 * @desc Retrieve featured properties.
 * @access Public
 */
router.get(
  '/featured',
  validateQuery(propertyQuerySchema),
  getFeaturedProperties
);

/**
 * @route GET /api/v1/properties/trending
 * @desc Retrieve trending properties.
 * @access Public
 */
router.get(
  '/trending',
  validateQuery(propertyQuerySchema),
  getTrendingProperties
);

/**
 * @route GET /api/v1/properties/nearby
 * @desc Retrieve properties nearby coordinates.
 * @access Public
 */
router.get(
  '/nearby',
  validateQuery(nearbyQuerySchema),
  getNearbyProperties
);

/**
 * @route GET /api/v1/properties/slug/:slug
 * @desc Retrieve a property listing by slug.
 * @access Public
 */
router.get(
  '/slug/:slug',
  getPropertyBySlug
);

/**
 * @route GET /api/v1/properties/:id
 * @desc Retrieve a property listing by Object ID.
 * @access Public
 */
router.get(
  '/:id',
  validateParams(propertyParamsSchema),
  getPropertyById
);

/**
 * @route PUT /api/v1/properties/:id
 * @desc Update an existing property listing.
 * @access Owner or Admin
 */
router.put(
  '/:id',
  verifyJWT,
  authorizeRoles('owner', 'admin'),
  validateParams(propertyParamsSchema),
  uploadMultiple,
  validateSchema(updatePropertySchema),
  updateProperty
);

/**
 * @route DELETE /api/v1/properties/:id
 * @desc Soft delete a property listing.
 * @access Owner or Admin
 */
router.delete(
  '/:id',
  verifyJWT,
  authorizeRoles('owner', 'admin'),
  validateParams(propertyParamsSchema),
  deleteProperty
);

/**
 * @route PATCH /api/v1/properties/:id/availability
 * @desc Update property availability status.
 * @access Owner or Admin
 */
router.patch(
  '/:id/availability',
  verifyJWT,
  authorizeRoles('owner', 'admin'),
  validateParams(propertyParamsSchema),
  validateSchema(updateAvailabilitySchema),
  updateAvailabilityStatus
);

/**
 * @route PATCH /api/v1/properties/:id/approve
 * @desc Approve a property listing.
 * @access Admin Only
 */
router.patch(
  '/:id/approve',
  verifyJWT,
  authorizeRoles('admin'),
  validateParams(propertyParamsSchema),
  approveProperty
);

/**
 * @route PATCH /api/v1/properties/:id/reject
 * @desc Reject a property listing.
 * @access Admin Only
 */
router.patch(
  '/:id/reject',
  verifyJWT,
  authorizeRoles('admin'),
  validateParams(propertyParamsSchema),
  rejectProperty
);

export default router;
