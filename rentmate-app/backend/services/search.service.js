import searchRepository from '../repositories/search.repository.js';

/**
 * Service to handle search queries with pagination, sorting, and geospatial criteria.
 * @param {Object} queryParams - Search filters
 * @returns {Promise<Object>}
 */
export const searchProperties = async (queryParams) => {
  return await searchRepository.searchProperties(queryParams);
};

/**
 * Service to retrieve properties in close physical proximity to latitude and longitude.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} maxDistanceKm - Max radius in kilometers
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>}
 */
export const getNearbyProperties = async (lat, lng, maxDistanceKm, limit) => {
  return await searchRepository.getNearbyProperties(lat, lng, maxDistanceKm, limit);
};

/**
 * Service to fetch verified properties marked as featured.
 * @param {number} limit - Max limit
 * @returns {Promise<Array>}
 */
export const getFeaturedProperties = async (limit) => {
  return await searchRepository.getFeaturedProperties(limit);
};

/**
 * Service to retrieve locality listings counts in a given city.
 * @param {string} city - Target city
 * @param {number} limit - Max limit
 * @returns {Promise<Array>}
 */
export const getTrendingLocalities = async (city, limit) => {
  return await searchRepository.getTrendingLocalities(city, limit);
};

/**
 * Service to offer search suggestions matching title or locality.
 * @param {string} searchQuery - Query keyword
 * @param {string} city - Optional city filter
 * @returns {Promise<Array>}
 */
export const getPropertySuggestions = async (searchQuery, city) => {
  return await searchRepository.getPropertySuggestions(searchQuery, city);
};

/**
 * Service to retrieve price bounds and category listing counts inside a city.
 * @param {string} city - Target city
 * @returns {Promise<Object>}
 */
export const getFilterCounts = async (city) => {
  return await searchRepository.getFilterCounts(city);
};

export default {
  searchProperties,
  getNearbyProperties,
  getFeaturedProperties,
  getTrendingLocalities,
  getPropertySuggestions,
  getFilterCounts,
};
