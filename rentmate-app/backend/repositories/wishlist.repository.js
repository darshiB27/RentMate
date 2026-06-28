import mongoose from 'mongoose';
import Wishlist from '../models/wishlistModel.js';
import logger from '../config/logger.js';

/**
 * Creates a new wishlist association document.
 * 
 * @param {string} userId - User identifier
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<Object>} - Saved wishlist document
 */
export const createWishlist = async (userId, propertyId) => {
  try {
    const item = new Wishlist({ userId, propertyId });
    return await item.save();
  } catch (error) {
    logger.error(`Repository error in createWishlist: ${error.message}`);
    throw error;
  }
};

/**
 * Finds a single wishlist document. Uses lean query format.
 * 
 * @param {string} userId - User identifier
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<Object|null>} - Wishlist document or null
 */
export const findWishlist = async (userId, propertyId) => {
  try {
    return await Wishlist.findOne({ userId, propertyId }).lean();
  } catch (error) {
    logger.error(`Repository error in findWishlist: ${error.message}`);
    throw error;
  }
};

/**
 * Deletes a wishlist document matching the user and property.
 * 
 * @param {string} userId - User identifier
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<Object|null>} - Deleted wishlist document or null
 */
export const deleteWishlist = async (userId, propertyId) => {
  try {
    return await Wishlist.findOneAndDelete({ userId, propertyId });
  } catch (error) {
    logger.error(`Repository error in deleteWishlist: ${error.message}`);
    throw error;
  }
};

/**
 * Toggles a property in a user's wishlist.
 * If present, deletes the record. If absent, saves a new one.
 * 
 * @param {string} userId - User identifier
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<Object>} - Object with toggled flag (true/false) and document details
 */
export const toggleWishlist = async (userId, propertyId) => {
  try {
    const existing = await Wishlist.findOne({ userId, propertyId });
    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return { toggled: false, document: null };
    } else {
      const newItem = new Wishlist({ userId, propertyId });
      const saved = await newItem.save();
      return { toggled: true, document: saved };
    }
  } catch (error) {
    logger.error(`Repository error in toggleWishlist: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves a user's paginated wishlist using a single-pass aggregation pipeline.
 * Performs joins to populate active property details and filters inactive/soft-deleted properties.
 * 
 * @param {string} userId - User identifier
 * @param {number} page - Page number
 * @param {number} limit - Items limit
 * @returns {Promise<Object>} - Paginated wishlist data containing total count metadata and records list
 */
export const getUserWishlist = async (userId, page = 1, limit = 10) => {
  try {
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    const pipeline = [
      // 1. Filter wishlist items matching current user ID
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      
      // 2. Perform lookup join on properties collection
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'propertyDetails',
        },
      },
      
      // 3. Unwind property details array
      { $unwind: { path: '$propertyDetails', preserveNullAndEmptyArrays: false } },
      
      // 4. Exclude soft-deleted or unapproved property details at database level
      {
        $match: {
          'propertyDetails.isDeleted': { $ne: true },
          'propertyDetails.verificationStatus': 'approved',
          'propertyDetails.availabilityStatus': 'available',
        },
      },
      
      // 5. Sort by newest wishlist association
      { $sort: { createdAt: -1 } },
      
      // 6. Pagination & Data Projection using Facets
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: parsedLimit },
            {
              $project: {
                _id: 1,
                userId: 1,
                propertyId: 1,
                createdAt: 1,
                updatedAt: 1,
                property: {
                  _id: '$propertyDetails._id',
                  title: '$propertyDetails.title',
                  price: '$propertyDetails.price',
                  type: '$propertyDetails.type',
                  sharingType: '$propertyDetails.sharingType',
                  genderCategory: '$propertyDetails.genderCategory',
                  address: '$propertyDetails.address',
                  images: { $slice: ['$propertyDetails.images', 1] }, // Performance slice: returns primary image only
                  ratingAverage: '$propertyDetails.ratingAverage',
                  ratingCount: '$propertyDetails.ratingCount',
                  location: '$propertyDetails.location',
                  isFeatured: '$propertyDetails.isFeatured',
                },
              },
            },
          ],
        },
      },
    ];

    const results = await Wishlist.aggregate(pipeline);
    
    const total = results[0]?.metadata[0]?.total || 0;
    const wishlistItems = results[0]?.data || [];

    return {
      wishlist: wishlistItems,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    };
  } catch (error) {
    logger.error(`Repository error in getUserWishlist: ${error.message}`);
    throw error;
  }
};

/**
 * Counts the total wishlist associations for a property.
 * 
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<number>} - Count of wishlist additions
 */
export const getWishlistCount = async (propertyId) => {
  try {
    return await Wishlist.countDocuments({ propertyId });
  } catch (error) {
    logger.error(`Repository error in getWishlistCount: ${error.message}`);
    throw error;
  }
};

/**
 * Checks if a user has wishlisted a property. Returns boolean.
 * 
 * @param {string} userId - User identifier
 * @param {string} propertyId - Property listing identifier
 * @returns {Promise<boolean>} - True if wishlisted, false otherwise
 */
export const isPropertyWishlisted = async (userId, propertyId) => {
  try {
    const item = await Wishlist.findOne({ userId, propertyId }).select('_id').lean();
    return !!item;
  } catch (error) {
    logger.error(`Repository error in isPropertyWishlisted: ${error.message}`);
    throw error;
  }
};

export default {
  createWishlist,
  findWishlist,
  deleteWishlist,
  toggleWishlist,
  getUserWishlist,
  getWishlistCount,
  isPropertyWishlisted,
};
