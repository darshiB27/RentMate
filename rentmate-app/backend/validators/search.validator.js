import { z } from 'zod';

// Reusable numeric coercion helper that returns undefined if not set/invalid
const coerceFloat = (defValue) => 
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defValue;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defValue : parsed;
  }, z.number().optional());

const coerceInt = (defValue) => 
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defValue;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defValue : parsed;
  }, z.number().int().optional());

// Validator schema for GET /search
export const searchPropertiesQuerySchema = z.object({
  city: z.string().trim().optional(),
  minPrice: coerceFloat(undefined),
  maxPrice: coerceFloat(undefined),
  gender: z.enum(['boys', 'girls', 'unisex']).optional(),
  sharingType: z.enum(['single', 'double', 'triple', 'quad', 'other']).optional(),
  propertyType: z.enum(['PG', 'Hostel', 'Flat']).optional(),
  amenities: z.union([z.string(), z.array(z.string())]).optional(),
  lat: coerceFloat(undefined),
  lng: coerceFloat(undefined),
  radius: coerceFloat(5),
  page: coerceInt(1),
  limit: coerceInt(10),
  sort: z.enum([
    'price_asc',
    'price_desc',
    'rating_desc',
    'distance_asc',
    'relevance',
    'newest',
    'oldest',
    'lowest_price',
    'highest_price',
    'highest_rated',
    'most_viewed',
    'most_wishlisted'
  ]).default('price_asc'),
  searchQuery: z.string().trim().optional(),
  availability: z.enum(['available', 'occupied', 'maintenance']).optional(),
  verificationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  featured: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    return val === 'true' || val === true;
  }, z.boolean().optional()),
  rating: coerceFloat(undefined),
  ownerVerified: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    return val === 'true' || val === true;
  }, z.boolean().optional()),
});

// Validator schema for GET /search/nearby
export const getNearbyPropertiesQuerySchema = z.object({
  lat: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number({ required_error: 'Latitude (lat) query parameter is required' })),
  lng: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number({ required_error: 'Longitude (lng) query parameter is required' })),
  radius: coerceFloat(5),
  limit: coerceInt(5),
});

// Validator schema for GET /search/featured
export const getFeaturedPropertiesQuerySchema = z.object({
  limit: coerceInt(6),
});

// Validator schema for GET /search/trending
export const getTrendingLocalitiesQuerySchema = z.object({
  city: z.string({ required_error: 'City query parameter is required' }).trim().min(1, 'City parameter cannot be empty'),
  limit: coerceInt(5),
});

// Validator schema for GET /search/suggestions
export const getPropertySuggestionsQuerySchema = z.object({
  searchQuery: z.string({ required_error: 'searchQuery query parameter is required' }).trim().min(1, 'searchQuery parameter cannot be empty'),
  city: z.string().trim().optional(),
});

// Validator schema for GET /search/filter-counts
export const getFilterCountsQuerySchema = z.object({
  city: z.string().trim().optional(),
});
