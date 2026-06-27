import searchService from '../services/search.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import STATUS_CODES from '../constants/statusCodes.js';

/**
 * Searches properties using dynamic filters, proximity coordinates, sorting, and pagination.
 * Handles the GET /search endpoint.
 */
export const searchProperties = asyncHandler(async (req, res) => {
  const result = await searchService.searchProperties(req.query);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Properties searched successfully.'));
});

/**
 * Retrieves properties physically near to latitude/longitude coordinates.
 * Handles the GET /search/nearby endpoint.
 */
export const getNearbyProperties = asyncHandler(async (req, res) => {
  const { lat, lng, radius, limit } = req.query;
  const result = await searchService.getNearbyProperties(lat, lng, radius, limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Nearby properties fetched successfully.'));
});

/**
 * Fetches verified properties marked as featured.
 * Handles the GET /search/featured endpoint.
 */
export const getFeaturedProperties = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const result = await searchService.getFeaturedProperties(limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Featured properties fetched successfully.'));
});

/**
 * Aggregates property densities in localities of a city, sorted by count.
 * Handles the GET /search/trending endpoint.
 */
export const getTrendingLocalities = asyncHandler(async (req, res) => {
  const { city, limit } = req.query;
  const result = await searchService.getTrendingLocalities(city, limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Trending localities fetched successfully.'));
});

/**
 * Offers search-bar autocompletion hints matching properties or localities.
 * Handles the GET /search/suggestions endpoint.
 */
export const getPropertySuggestions = asyncHandler(async (req, res) => {
  const { searchQuery, city } = req.query;
  const result = await searchService.getPropertySuggestions(searchQuery, city);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Suggestions fetched successfully.'));
});

/**
 * Generates aggregated price boundaries and count summaries per category inside a city.
 * Handles the GET /search/filter-counts endpoint.
 */
export const getFilterCounts = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const result = await searchService.getFilterCounts(city);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Filter counts fetched successfully.'));
});

export default {
  searchProperties,
  getNearbyProperties,
  getFeaturedProperties,
  getTrendingLocalities,
  getPropertySuggestions,
  getFilterCounts,
};
