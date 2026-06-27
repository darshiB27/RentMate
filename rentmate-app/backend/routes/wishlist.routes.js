import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  getUserWishlist,
  checkIsWishlisted,
  getPropertyWishlistCount,
} from '../controllers/wishlist.controller.js';
import { verifyJWT, optionalAuth } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateQuery, validateParams } from '../middleware/validateMiddleware.js';
import {
  wishlistQuerySchema,
  wishlistParamsSchema,
} from '../validators/wishlist.validator.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// PUBLIC — Authenticated OR unauthenticated
// GET /count/:propertyId — wishlist count is a public metric visible to all
// ---------------------------------------------------------------------------

/**
 * @route GET /api/v1/wishlist/count/:propertyId
 * @desc Retrieve the total wishlist additions for a property listing.
 * @access Public (tenant | owner | admin | unauthenticated)
 */
router.get(
  '/count/:propertyId',
  optionalAuth,                           // Attach req.user if token present, but never block
  validateParams(wishlistParamsSchema),
  getPropertyWishlistCount
);

// ---------------------------------------------------------------------------
// PROTECTED — Tenant only (JWT required + role check)
// ---------------------------------------------------------------------------

// Apply JWT + tenant role guard to all routes below this point
router.use(verifyJWT);
router.use(authorizeRoles('tenant'));

/**
 * @route POST /api/v1/wishlist/:propertyId
 * @desc Add a property listing to the user's wishlist.
 * @access Private (Tenant Only)
 */
router.post('/:propertyId', validateParams(wishlistParamsSchema), addToWishlist);

/**
 * @route DELETE /api/v1/wishlist/:propertyId
 * @desc Remove a property listing from the user's wishlist.
 * @access Private (Tenant Only)
 */
router.delete('/:propertyId', validateParams(wishlistParamsSchema), removeFromWishlist);

/**
 * @route PATCH /api/v1/wishlist/toggle/:propertyId
 * @desc Toggle wishlist status — adds if absent, removes if present.
 * @access Private (Tenant Only)
 */
router.patch('/toggle/:propertyId', validateParams(wishlistParamsSchema), toggleWishlist);

/**
 * @route GET /api/v1/wishlist/me
 * @desc Retrieve the paginated wishlist for the authenticated user.
 * @access Private (Tenant Only)
 */
router.get('/me', validateQuery(wishlistQuerySchema), getUserWishlist);

/**
 * @route GET /api/v1/wishlist/check/:propertyId
 * @desc Check if a property is wishlisted by the current user.
 * @access Private (Tenant Only)
 */
router.get('/check/:propertyId', validateParams(wishlistParamsSchema), checkIsWishlisted);

export default router;
