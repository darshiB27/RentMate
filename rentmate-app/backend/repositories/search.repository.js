import Property from '../models/property.model.js';
import logger from '../config/logger.js';

/**
 * Executes a geospatial and filtered property search using a single-pass aggregate facet query.
 * Handles coordinate-based $geoNear, text indexing matching, Atlas Search, sorting, and pagination.
 * 
 * @param {Object} queryParams - Search filters.
 * @returns {Promise<Object>} - Paginated property documents and metadata.
 */
// Reusable helper to escape regex characters safely
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const searchProperties = async (queryParams) => {
  try {
    const {
      city,
      minPrice,
      maxPrice,
      gender,
      sharingType,
      propertyType,
      amenities,
      lat,
      lng,
      radius = 5,
      page = 1,
      limit = 10,
      sort = 'price_asc',
      searchQuery,
      availability,
      verificationStatus,
      featured,
      rating,
      ownerVerified,
    } = queryParams;

    const pipeline = [];
    const hasCoords = lat !== undefined && lat !== null && lat !== '' && lng !== undefined && lng !== null && lng !== '';
    const useAtlasSearch = process.env.MONGODB_ATLAS_SEARCH === 'true' && searchQuery;

    // 1. CHOOSE INITIAL STAGE: GEOSPATIAL ($geoNear) OR ATLAS SEARCH ($search)
    if (hasCoords) {
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseFloat(radius) * 1000, // Convert km to meters
          spherical: true,
          key: 'location',
        },
      });
    } else if (useAtlasSearch) {
      pipeline.push({
        $search: {
          index: 'property_search',
          text: {
            query: searchQuery,
            path: ['title', 'description', 'address.locality', 'address.city'],
            fuzzy: {
              maxEdits: 1,
              prefixLength: 2,
            },
          },
        },
      });
    }

    // 2. CONSTRUCT DYNAMIC MATCH FILTERS
    const matchFilters = {
      isDeleted: { $ne: true },
    };

    // Default status filters unless queried explicitly
    if (verificationStatus) {
      matchFilters.verificationStatus = verificationStatus;
    } else {
      matchFilters.verificationStatus = 'approved';
    }

    if (availability) {
      matchFilters.availabilityStatus = availability;
    } else {
      matchFilters.availabilityStatus = 'available';
    }

    if (featured !== undefined) {
      matchFilters.isFeatured = featured === 'true' || featured === true;
    }

    if (rating !== undefined && rating !== null) {
      matchFilters.ratingAverage = { $gte: parseFloat(rating) };
    }

    if (city && typeof city === 'string') {
      const trimmedCity = city.trim();
      if (trimmedCity) {
        matchFilters['address.city'] = { $regex: new RegExp(escapeRegExp(trimmedCity), 'i') };
      }
    }

    const hasMinPrice = minPrice !== undefined && minPrice !== null && minPrice !== '';
    const hasMaxPrice = maxPrice !== undefined && maxPrice !== null && maxPrice !== '';
    if (hasMinPrice || hasMaxPrice) {
      matchFilters.price = {};
      if (hasMinPrice) matchFilters.price.$gte = parseFloat(minPrice);
      if (hasMaxPrice) matchFilters.price.$lte = parseFloat(maxPrice);
    }

    if (gender) matchFilters.genderCategory = gender;
    if (sharingType) matchFilters.sharingType = sharingType;
    if (propertyType) matchFilters.type = propertyType;

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      matchFilters.amenities = { $all: amenitiesArray.map((a) => a.trim()) };
    }

    // Keyword Search Regex fallback (case-insensitive partial matching, extra-space handling)
    const cleanedQuery = searchQuery ? searchQuery.trim().replace(/\s+/g, ' ') : '';
    const keywords = cleanedQuery ? cleanedQuery.split(' ').filter(Boolean) : [];
    if (keywords.length > 0 && !useAtlasSearch) {
      const keywordRegexes = keywords.map(word => {
        const regex = { $regex: escapeRegExp(word), $options: 'i' };
        return {
          $or: [
            { title: regex },
            { description: regex },
            { 'address.city': regex },
            { 'address.locality': regex },
            { 'address.street': regex },
            { type: regex }
          ]
        };
      });
      matchFilters.$and = keywordRegexes;
    }

    pipeline.push({ $match: matchFilters });

    // 3. CONSTRUCT DYNAMIC SORTING
    const sortConfig = {};
    let projectScore = false;

    if (sort === 'price_asc' || sort === 'lowest_price') {
      sortConfig.price = 1;
    } else if (sort === 'price_desc' || sort === 'highest_price') {
      sortConfig.price = -1;
    } else if (sort === 'rating_desc' || sort === 'highest_rated') {
      sortConfig.ratingAverage = -1;
      sortConfig.ratingCount = -1;
    } else if (sort === 'most_viewed') {
      sortConfig.viewsCount = -1;
    } else if (sort === 'most_wishlisted') {
      sortConfig.wishlistCount = -1;
    } else if (sort === 'oldest') {
      sortConfig.createdAt = 1;
    } else if (sort === 'distance_asc' && hasCoords) {
      sortConfig.distance = 1;
    } else if (sort === 'relevance' && !hasCoords && useAtlasSearch) {
      sortConfig.score = { $meta: 'searchScore' };
      projectScore = true;
    } else {
      sortConfig.createdAt = -1; // newest
    }

    pipeline.push({ $sort: sortConfig });

    // 4. CHOOSE STAGE TO JOIN OWNER (LOOKUP BEFORE OR AFTER FACET PAGINATION)
    const hasOwnerVerifiedFilter = ownerVerified !== undefined && ownerVerified !== '';
    if (hasOwnerVerifiedFilter) {
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      });
      pipeline.push({
        $unwind: {
          path: '$owner',
          preserveNullAndEmptyArrays: true,
        },
      });
      const isOwnerVerifiedTrue = ownerVerified === true || ownerVerified === 'true';
      pipeline.push({
        $match: { 'owner.isVerified': isOwnerVerifiedTrue },
      });
    }

    // 5. DEFINE PROJECTION FIELDS (Lean Query & Performance Optimization)
    const projectFields = {
      _id: 1,
      title: 1,
      price: 1,
      type: 1,
      sharingType: 1,
      genderCategory: 1,
      amenities: 1,
      location: 1,
      address: 1,
      images: { $slice: ['$images', 1] },
      ratingAverage: 1,
      ratingCount: 1,
      isFeatured: 1,
      viewsCount: 1,
      wishlistCount: 1,
      createdAt: 1,
      owner: {
        name: '$owner.name',
        avatar: '$owner.avatar',
      },
    };

    if (hasCoords) {
      projectFields.distance = 1;
    }

    if (projectScore) {
      projectFields.score = { $meta: 'searchScore' };
    }

    // Pagination offset
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    // Define data pipeline stages
    const dataStages = [
      { $skip: skip },
      { $limit: parsedLimit },
    ];

    // If ownerVerified was not checked, join owner only for the paginated subset of documents to optimize speed
    if (!hasOwnerVerifiedFilter) {
      dataStages.push(
        {
          $lookup: {
            from: 'users',
            localField: 'ownerId',
            foreignField: '_id',
            as: 'owner',
          },
        },
        {
          $unwind: {
            path: '$owner',
            preserveNullAndEmptyArrays: true,
          },
        }
      );
    }

    // Project fields only at the end
    dataStages.push({ $project: projectFields });

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: dataStages,
      },
    });

    const results = await Property.aggregate(pipeline);
    const total = results[0]?.metadata[0]?.total || 0;
    const properties = results[0]?.data || [];

    return {
      properties,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    };
  } catch (error) {
    logger.error(`Repository error in searchProperties: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves properties within close proximity to specified coordinates using spherical 2dsphere queries.
 * Optimized with lean projections and pagination limits.
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} maxDistanceKm - Max radius in kilometers
 * @param {number} limit - Maximum number of documents to return
 * @returns {Promise<Array>} - List of nearby property documents
 */
export const getNearbyProperties = async (lat, lng, maxDistanceKm = 5, limit = 5) => {
  try {
    if (!lat || !lng) {
      throw new Error('Coordinates (lat, lng) are required for nearby properties lookup');
    }

    return await Property.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseFloat(maxDistanceKm) * 1000, // Convert km to meters
          spherical: true,
          key: 'location',
        },
      },
      {
        $match: {
          verificationStatus: 'approved',
          availabilityStatus: 'available',
          isDeleted: { $ne: true },
        },
      },
      { $limit: parseInt(limit, 10) || 5 },
      {
        $project: {
          _id: 1,
          title: 1,
          price: 1,
          genderCategory: 1,
          type: 1,
          sharingType: 1,
          address: 1,
          images: { $slice: ['$images', 1] },
          ratingAverage: 1,
          distance: 1,
        },
      },
    ]);
  } catch (error) {
    logger.error(`Repository error in getNearbyProperties: ${error.message}`);
    throw error;
  }
};

/**
 * Fetches listings marked as featured. Uses lean queries for fast, read-only performance.
 * 
 * @param {number} limit - Maximum number of documents to return
 * @returns {Promise<Array>} - List of featured property documents
 */
export const getFeaturedProperties = async (limit = 6) => {
  try {
    return await Property.find({
      isFeatured: true,
      verificationStatus: 'approved',
      availabilityStatus: 'available',
      isDeleted: { $ne: true },
    })
      .select('title price type sharingType genderCategory address images ratingAverage ratingCount')
      .limit(parseInt(limit, 10) || 6)
      .slice('images', 1) // Returns only the primary image
      .lean();
  } catch (error) {
    logger.error(`Repository error in getFeaturedProperties: ${error.message}`);
    throw error;
  }
};

/**
 * Aggregates property counts in localities of a city, sorting by popular listings densities.
 * Helpful for showing "Popular Localities" on the home page.
 * 
 * @param {string} city - The city name
 * @param {number} limit - Maximum number of localities to return
 * @returns {Promise<Array>} - Grouped locality data with property count and average price
 */
export const getTrendingLocalities = async (city, limit = 5) => {
  try {
    if (!city) {
      throw new Error('City parameter is required to fetch trending localities');
    }

    return await Property.aggregate([
      {
        $match: {
          'address.city': { $regex: new RegExp(escapeRegExp(city.trim()), 'i') },
          verificationStatus: 'approved',
          availabilityStatus: 'available',
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: '$address.locality',
          propertiesCount: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          coordinates: { $first: '$location.coordinates' },
        },
      },
      { $sort: { propertiesCount: -1 } },
      { $limit: parseInt(limit, 10) || 5 },
      {
        $project: {
          _id: 0,
          locality: '$_id',
          propertiesCount: 1,
          averagePrice: { $round: ['$averagePrice', 0] },
          coordinates: 1,
        },
      },
    ]);
  } catch (error) {
    logger.error(`Repository error in getTrendingLocalities: ${error.message}`);
    throw error;
  }
};

/**
 * Provides search-bar autocompletion suggestions matching localities or property titles.
 * Uses lean queries and restricts payload.
 * 
 * @param {string} searchQuery - Input search text
 * @param {string} city - Optional city filter
 * @returns {Promise<Array>} - List of suggested titles and localities
 */
export const getPropertySuggestions = async (searchQuery, city) => {
  try {
    if (!searchQuery) {
      return [];
    }

    const filter = {
      verificationStatus: 'approved',
      availabilityStatus: 'available',
      isDeleted: { $ne: true },
    };

    if (city && typeof city === 'string') {
      const trimmedCity = city.trim();
      if (trimmedCity) {
        filter['address.city'] = { $regex: new RegExp(escapeRegExp(trimmedCity), 'i') };
      }
    }

    // Match query against title or locality
    filter.$or = [
      { title: { $regex: searchQuery, $options: 'i' } },
      { 'address.locality': { $regex: searchQuery, $options: 'i' } },
    ];

    return await Property.find(filter)
      .select('title address.locality address.city')
      .limit(8)
      .lean();
  } catch (error) {
    logger.error(`Repository error in getPropertySuggestions: ${error.message}`);
    throw error;
  }
};

/**
 * Generates aggregated category counts and min/max price boundaries for frontend filter panels.
 * Executes in a single aggregation facet to prevent multiple DB queries.
 * 
 * @param {string} city - Optional city filter
 * @returns {Promise<Object>} - Min/max price and property counts per category
 */
export const getFilterCounts = async (city) => {
  try {
    const matchFilters = {
      verificationStatus: 'approved',
      availabilityStatus: 'available',
      isDeleted: { $ne: true },
    };

    if (city && typeof city === 'string') {
      const trimmedCity = city.trim();
      if (trimmedCity) {
        matchFilters['address.city'] = { $regex: new RegExp(escapeRegExp(trimmedCity), 'i') };
      }
    }

    const results = await Property.aggregate([
      { $match: matchFilters },
      {
        $facet: {
          priceBoundary: [
            {
              $group: {
                _id: null,
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
              },
            },
          ],
          genderCounts: [{ $group: { _id: '$genderCategory', count: { $sum: 1 } } }],
          typeCounts: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
          sharingCounts: [{ $group: { _id: '$sharingType', count: { $sum: 1 } } }],
        },
      },
    ]);

    const priceBoundary = results[0]?.priceBoundary[0] || { minPrice: 0, maxPrice: 0 };
    
    // Transform arrays into key-value count objects
    const formatCounts = (array) => {
      return array.reduce((acc, curr) => {
        if (curr._id) {
          acc[curr._id] = curr.count;
        }
        return acc;
      }, {});
    };

    return {
      minPrice: priceBoundary.minPrice || 0,
      maxPrice: priceBoundary.maxPrice || 0,
      gender: formatCounts(results[0]?.genderCounts || []),
      type: formatCounts(results[0]?.typeCounts || []),
      sharing: formatCounts(results[0]?.sharingCounts || []),
    };
  } catch (error) {
    logger.error(`Repository error in getFilterCounts: ${error.message}`);
    throw error;
  }
};

export default {
  searchProperties,
  getNearbyProperties,
  getFeaturedProperties,
  getTrendingLocalities,
  getPropertySuggestions,
  getFilterCounts,
};
