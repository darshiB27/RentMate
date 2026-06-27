import Property from '../models/property.model.js';
import logger from '../config/logger.js';

/**
 * Creates and persists a new property listing.
 * Supports transactional sessions.
 * 
 * @param {Object} data - Property listing details
 * @param {Object} session - Mongoose transaction session
 * @returns {Promise<Object>} - Saved Property document
 */
export const createProperty = async (data, session = null) => {
  try {
    const property = new Property(data);
    return await property.save({ session });
  } catch (error) {
    logger.error(`Repository error in createProperty: ${error.message}`);
    throw error;
  }
};

/**
 * Find Property document by ObjectId.
 * Automatically respects soft-delete middleware exclusions.
 * 
 * @param {string} id - Target property ID
 * @param {Object} options - Query configuration: { select, session, lean }
 * @returns {Promise<Object|null>} - Property document or null
 */
export const findPropertyById = async (id, { select = '', session = null, lean = true } = {}) => {
  try {
    let query = Property.findById(id).session(session);
    if (select) query = query.select(select);
    query = query.populate({
      path: 'ownerId',
      select: 'name email phoneNumber avatar',
    });
    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    // If populate fails due to invalid ownerId (CastError), retry without populate
    if (error.name === 'CastError' && error.path === '_id' && error.model?.modelName === 'User') {
      logger.warn(`Property ${id} has invalid ownerId. Returning without owner populate.`);
      try {
        let fallbackQuery = Property.findById(id).session(session);
        if (select) fallbackQuery = fallbackQuery.select(select);
        if (lean) fallbackQuery = fallbackQuery.lean();
        return await fallbackQuery;
      } catch (fallbackError) {
        logger.error(`Repository fallback error in findPropertyById: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
    logger.error(`Repository error in findPropertyById: ${error.message}`);
    throw error;
  }
};


/**
 * Retrieves a listing by its unique slug.
 * 
 * @param {string} slug - Target listing slug
 * @param {Object} options - Query settings: { lean }
 * @returns {Promise<Object|null>} - Property document or null
 */
export const findPropertyBySlug = async (slug, { lean = true } = {}) => {
  try {
    let query = Property.findOne({ slug }).populate({
      path: 'ownerId',
      select: 'name email phoneNumber avatar',
    });
    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    logger.error(`Repository error in findPropertyBySlug: ${error.message}`);
    throw error;
  }
};

/**
 * Updates an existing property listing.
 * Supports transactional sessions.
 * 
 * @param {string} id - Target property ID
 * @param {Object} data - Field updates payload
 * @param {Object} session - Mongoose transaction session
 * @returns {Promise<Object|null>} - Updated Property document
 */
export const updateProperty = async (id, data, session = null) => {
  try {
    const isOperator = Object.keys(data).some((key) => key.startsWith('$'));
    const updateQuery = isOperator ? data : { $set: data };
    return await Property.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true, runValidators: true, session }
    );
  } catch (error) {
    logger.error(`Repository error in updateProperty: ${error.message}`);
    throw error;
  }
};

/**
 * Soft deletes a property listing by updating the isDeleted flag.
 * Supports transactional sessions.
 * 
 * @param {string} id - Target property ID
 * @param {Object} session - Mongoose transaction session
 * @returns {Promise<Object|null>} - Bypassed/deleted property document
 */
export const deleteProperty = async (id, session = null) => {
  try {
    return await Property.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true, session }
    );
  } catch (error) {
    logger.error(`Repository error in deleteProperty: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves paginated property listings owned by a specific owner.
 * 
 * @param {string} ownerId - Owner identifier
 * @param {number} skip - Offset skip
 * @param {number} limit - Page size limit
 * @returns {Promise<Object>} - Listings list and total count
 */
export const getOwnerProperties = async (ownerId, skip = 0, limit = 10) => {
  try {
    // Un-approved and approved listings are both returned to the owner
    const properties = await Property.find({ ownerId })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Property.countDocuments({ ownerId });
    return { properties, total };
  } catch (error) {
    logger.error(`Repository error in getOwnerProperties: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves paginated featured listings that are approved and available.
 * Projects only the first preview image to minimize payload transfer.
 * 
 * @param {number} skip - Offset skip
 * @param {number} limit - Page size limit
 * @returns {Promise<Object>} - Listings and total count
 */
export const getFeaturedProperties = async (skip = 0, limit = 10) => {
  try {
    const filter = {
      isFeatured: true,
      verificationStatus: 'approved',
      availabilityStatus: 'available',
    };

    const properties = await Property.find(filter)
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .select({ images: { $slice: 1 } })
      .sort({ createdAt: -1 })
      .lean();

    const total = await Property.countDocuments(filter);
    return { properties, total };
  } catch (error) {
    logger.error(`Repository error in getFeaturedProperties: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves paginated trending listings (sorted by highest average rating).
 * 
 * @param {number} skip - Offset skip
 * @param {number} limit - Page size limit
 * @returns {Promise<Object>} - Listings and total count
 */
export const getTrendingProperties = async (skip = 0, limit = 10) => {
  try {
    const filter = {
      verificationStatus: 'approved',
      availabilityStatus: 'available',
    };

    const properties = await Property.find(filter)
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .select({ images: { $slice: 1 } })
      .sort({ ratingAverage: -1, ratingCount: -1 })
      .lean();

    const total = await Property.countDocuments(filter);
    return { properties, total };
  } catch (error) {
    logger.error(`Repository error in getTrendingProperties: ${error.message}`);
    throw error;
  }
};

/**
 * Performs proximity search queries using MongoDB $geoNear aggregation pipeline,
 * returning distance calculations to the client.
 * 
 * @param {Array} coordinates - GeoJSON coordinates [longitude, latitude]
 * @param {number} maxDistanceInMeters - Search radius range
 * @param {number} skip - Offset skip
 * @param {number} limit - Page size limit
 * @returns {Promise<Object>} - Nearby listings and total count
 */
export const getNearbyProperties = async (coordinates, maxDistanceInMeters = 5000, skip = 0, limit = 10) => {
  try {
    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates },
          distanceField: 'distance',
          maxDistance: maxDistanceInMeters,
          spherical: true,
          query: {
            verificationStatus: 'approved',
            availabilityStatus: 'available',
            isDeleted: { $ne: true },
          },
        },
      },
      {
        $facet: {
          properties: [
            { $skip: parseInt(skip, 10) },
            { $limit: parseInt(limit, 10) },
            {
              $project: {
                title: 1,
                price: 1,
                type: 1,
                sharingType: 1,
                genderCategory: 1,
                ratingAverage: 1,
                address: 1,
                images: { $slice: ['$images', 1] },
                distance: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await Property.aggregate(pipeline);
    const properties = result[0]?.properties || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return { properties, total };
  } catch (error) {
    logger.error(`Repository error in getNearbyProperties: ${error.message}`);
    throw error;
  }
};

export default {
  createProperty,
  findPropertyById,
  findPropertyBySlug,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
  getFeaturedProperties,
  getTrendingProperties,
  getNearbyProperties,
};
