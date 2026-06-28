import express from 'express';
import {
  searchProperties,
  getNearbyProperties,
  getFeaturedProperties,
  getTrendingLocalities,
  getPropertySuggestions,
  getFilterCounts,
} from '../controllers/search.controller.js';
import { validateQuery } from '../middleware/validateMiddleware.js';
import {
  searchPropertiesQuerySchema,
  getNearbyPropertiesQuerySchema,
  getFeaturedPropertiesQuerySchema,
  getTrendingLocalitiesQuerySchema,
  getPropertySuggestionsQuerySchema,
  getFilterCountsQuerySchema,
} from '../validators/search.validator.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route GET /api/v1/search
 * @desc Main search endpoint supporting dynamic filters, keywords, geospatial proximity, sorting, and offset-based pagination.
 * @access Public (with Optional Authentication user parsing)
 */
router.get('/', validateQuery(searchPropertiesQuerySchema), optionalAuth, searchProperties);

/**
 * @route GET /api/v1/search/nearby
 * @desc Proximity search returning properties in physical coordinates range of latitude/longitude.
 * @access Public (with Optional Authentication user parsing)
 */
router.get('/nearby', validateQuery(getNearbyPropertiesQuerySchema), optionalAuth, getNearbyProperties);

/**
 * @route GET /api/v1/search/featured
 * @desc Retrieves verified, available property listings marked as featured.
 * @access Public (with Optional Authentication user parsing)
 */
router.get('/featured', validateQuery(getFeaturedPropertiesQuerySchema), optionalAuth, getFeaturedProperties);

/**
 * @route GET /api/v1/search/trending
 * @desc Aggregates locality density listing groups inside a specified city.
 * @access Public (with Optional Authentication user parsing)
 */
router.get('/trending', validateQuery(getTrendingLocalitiesQuerySchema), optionalAuth, getTrendingLocalities);

/**
 * @route GET /api/v1/search/suggestions
 * @desc Provides real-time autocompletion hints matching titles or localities.
 * @access Public (with Optional Authentication user parsing)
 */
router.get('/suggestions', validateQuery(getPropertySuggestionsQuerySchema), optionalAuth, getPropertySuggestions);

/**
 * @route GET /api/v1/search/filter-counts
 * @desc Dynamically aggregates min/max price boundaries and category listing counts for frontend filter sidebars.
 * @access Public (with Optional Authentication user parsing)
 */
router.get('/filter-counts', validateQuery(getFilterCountsQuerySchema), optionalAuth, getFilterCounts);

export default router;
