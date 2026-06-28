import mongoose from 'mongoose';
import PropertyView from '../models/propertyView.model.js';
import Analytics from '../models/analytics.model.js';
import Property from '../models/property.model.js';
import User from '../models/userModel.js';
import Inquiry from '../models/inquiry.model.js';
import Wishlist from '../models/wishlistModel.js';
import logger from '../config/logger.js';

/**
 * Persists a raw property view record.
 * 
 * @param {Object} data - View parameters (propertyId, viewerId, ipHash)
 * @returns {Promise<Object>} - Saved PropertyView document
 */
export const createPropertyView = async (data) => {
  try {
    const view = new PropertyView(data);
    return await view.save();
  } catch (error) {
    logger.error(`Repository error in createPropertyView: ${error.message}`);
    throw error;
  }
};

/**
 * Checks if a view from the same IP hash exists for a property within the last 24 hours.
 * 
 * @param {string} propertyId - Property identifier
 * @param {string} ipHash - Viewer IP hash
 * @returns {Promise<boolean>} - True if viewed in last 24 hours, false otherwise
 */
export const hasViewedInLast24Hours = async (propertyId, ipHash) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const view = await PropertyView.findOne({
      propertyId,
      ipHash,
      createdAt: { $gte: oneDayAgo },
    }).lean();
    return !!view;
  } catch (error) {
    logger.error(`Repository error in hasViewedInLast24Hours: ${error.message}`);
    throw error;
  }
};

/**
 * Aggregates top properties based on recent raw view counts.
 * 
 * @param {number} limit - Max properties to return
 * @returns {Promise<Array>} - Aggregated properties list
 */
export const getTopProperties = async (limit = 5) => {
  try {
    return await PropertyView.aggregate([
      {
        $group: {
          _id: '$propertyId',
          viewsCount: { $sum: 1 },
        },
      },
      { $sort: { viewsCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'properties',
          localField: '_id',
          foreignField: '_id',
          as: 'property',
        },
      },
      { $unwind: '$property' },
      // Filter out soft-deleted properties
      { $match: { 'property.isDeleted': { $ne: true } } },
      {
        $project: {
          _id: 0,
          propertyId: '$_id',
          viewsCount: 1,
          title: '$property.title',
          price: '$property.price',
          type: '$property.type',
          images: { $slice: ['$property.images', 1] },
          ratingAverage: '$property.ratingAverage',
          locality: '$property.address.locality',
          city: '$property.address.city',
        },
      },
    ]);
  } catch (error) {
    logger.error(`Repository error in getTopProperties: ${error.message}`);
    throw error;
  }
};

/**
 * Aggregates top address localities based on density of properties and view metrics.
 * 
 * @param {number} limit - Max localities to return
 * @returns {Promise<Array>} - Locality statistics
 */
export const getTopLocalities = async (limit = 5) => {
  try {
    return await Property.aggregate([
      { $match: { isDeleted: { $ne: true }, verificationStatus: 'approved' } },
      {
        $group: {
          _id: {
            locality: '$address.locality',
            city: '$address.city',
          },
          propertiesCount: { $sum: 1 },
          averagePrice: { $avg: '$price' },
        },
      },
      { $sort: { propertiesCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          locality: '$_id.locality',
          city: '$_id.city',
          propertiesCount: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
        },
      },
    ]);
  } catch (error) {
    logger.error(`Repository error in getTopLocalities: ${error.message}`);
    throw error;
  }
};

/**
 * Aggregates top cities based on density of property listings.
 * 
 * @param {number} limit - Max cities to return
 * @returns {Promise<Array>} - City statistics
 */
export const getTopCities = async (limit = 5) => {
  try {
    return await Property.aggregate([
      { $match: { isDeleted: { $ne: true }, verificationStatus: 'approved' } },
      {
        $group: {
          _id: '$address.city',
          propertiesCount: { $sum: 1 },
          averagePrice: { $avg: '$price' },
        },
      },
      { $sort: { propertiesCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          city: '$_id',
          propertiesCount: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
        },
      },
    ]);
  } catch (error) {
    logger.error(`Repository error in getTopCities: ${error.message}`);
    throw error;
  }
};

/**
 * Aggregates materialized historical stats for an owner's properties.
 * 
 * @param {string} ownerId - Owner identifier
 * @param {Date} startDate - Start date of boundary
 * @param {Date} endDate - End date of boundary
 * @returns {Promise<Object>} - Consolidated owner metrics
 */
export const getOwnerStats = async (ownerId, startDate, endDate) => {
  try {
    const stats = await Analytics.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(ownerId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewsCount' },
          totalInquiries: { $sum: '$inquiriesCount' },
          totalWishlist: { $sum: '$wishlistCount' },
        },
      },
    ]);

    const dailyBreakdown = await Analytics.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(ownerId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$date',
          views: { $sum: '$viewsCount' },
          inquiries: { $sum: '$inquiriesCount' },
          wishlist: { $sum: '$wishlistCount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const summary = stats[0] || { totalViews: 0, totalInquiries: 0, totalWishlist: 0 };
    return {
      summary,
      dailyBreakdown,
    };
  } catch (error) {
    logger.error(`Repository error in getOwnerStats: ${error.message}`);
    throw error;
  }
};

/**
 * Aggregates materialized historical stats globally across the system.
 * 
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Global admin KPIs
 */
export const getAdminStats = async (startDate, endDate) => {
  try {
    const stats = await Analytics.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewsCount' },
          totalInquiries: { $sum: '$inquiriesCount' },
          totalWishlist: { $sum: '$wishlistCount' },
        },
      },
    ]);

    const activeUsers = await User.countDocuments({ isDeleted: { $ne: true } });
    const totalProperties = await Property.countDocuments({ isDeleted: { $ne: true } });

    const summary = stats[0] || { totalViews: 0, totalInquiries: 0, totalWishlist: 0 };
    return {
      summary: {
        ...summary,
        activeUsers,
        totalProperties,
      },
    };
  } catch (error) {
    logger.error(`Repository error in getAdminStats: ${error.message}`);
    throw error;
  }
};

/**
 * Bulk upserts daily compiled metrics into the Analytics collection.
 * 
 * @param {Array} metricsArray - Consolidated daily metrics records
 * @returns {Promise<Object>} - Bulk write status result
 */
export const saveDailyMetrics = async (metricsArray) => {
  try {
    if (metricsArray.length === 0) return { upsertedCount: 0 };

    const operations = metricsArray.map((item) => ({
      updateOne: {
        filter: {
          propertyId: item.propertyId,
          date: item.date,
        },
        update: {
          $set: {
            ownerId: item.ownerId,
            viewsCount: item.viewsCount,
            inquiriesCount: item.inquiriesCount,
            wishlistCount: item.wishlistCount,
          },
        },
        upsert: true,
      },
    }));

    return await Analytics.bulkWrite(operations);
  } catch (error) {
    logger.error(`Repository error in saveDailyMetrics: ${error.message}`);
    throw error;
  }
};

/**
 * Aggregates raw view, inquiry, and wishlist metrics for the current/previous day to compile.
 * 
 * @param {Date} targetDate - Target day (normalized start of day)
 * @returns {Promise<Array>} - Compiled records array
 */
export const compileDailyListingMetrics = async (targetDate) => {
  try {
    const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    // Group views count
    const views = await PropertyView.aggregate([
      { $match: { createdAt: { $gte: targetDate, $lt: nextDay } } },
      { $group: { _id: '$propertyId', count: { $sum: 1 } } },
    ]);

    // Group inquiries count
    const inquiries = await Inquiry.aggregate([
      { $match: { createdAt: { $gte: targetDate, $lt: nextDay } } },
      { $group: { _id: '$propertyId', count: { $sum: 1 } } },
    ]);

    // Fetch active wishlist counts per property (current snapshot)
    const wishlists = await Wishlist.aggregate([
      { $group: { _id: '$propertyId', count: { $sum: 1 } } },
    ]);

    // Find all properties to ensure we build a complete map
    const properties = await Property.find({ isDeleted: { $ne: true } }).select('_id ownerId').lean();

    const viewsMap = new Map(views.map(v => [v._id.toString(), v.count]));
    const inquiriesMap = new Map(inquiries.map(i => [i._id.toString(), i.count]));
    const wishlistsMap = new Map(wishlists.map(w => [w._id.toString(), w.count]));

    return properties.map((prop) => {
      const propIdStr = prop._id.toString();
      return {
        propertyId: prop._id,
        ownerId: prop.ownerId,
        date: targetDate,
        viewsCount: viewsMap.get(propIdStr) || 0,
        inquiriesCount: inquiriesMap.get(propIdStr) || 0,
        wishlistCount: wishlistsMap.get(propIdStr) || 0,
      };
    });
  } catch (error) {
    logger.error(`Repository error in compileDailyListingMetrics: ${error.message}`);
    throw error;
  }
};

export default {
  createPropertyView,
  hasViewedInLast24Hours,
  getTopProperties,
  getTopLocalities,
  getTopCities,
  getOwnerStats,
  getAdminStats,
  saveDailyMetrics,
  compileDailyListingMetrics,
};
