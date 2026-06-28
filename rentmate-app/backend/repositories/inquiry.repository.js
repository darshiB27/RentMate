import mongoose from 'mongoose';
import Inquiry from '../models/inquiry.model.js';
import logger from '../config/logger.js';

/**
 * Creates and saves a new property inquiry.
 * Supports transactional sessions.
 * 
 * @param {Object} inquiryData - Inquiry payload details
 * @param {Object} session - Mongoose transaction session
 * @returns {Promise<Object>} - Saved inquiry document
 */
export const createInquiry = async (inquiryData, session = null) => {
  try {
    const inquiry = new Inquiry(inquiryData);
    return await inquiry.save({ session });
  } catch (error) {
    logger.error(`Repository error in createInquiry: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves an inquiry by its ID, populating details for properties and tenants.
 * 
 * @param {string} id - Inquiry identifier
 * @param {Object} options - Query configuration: { session, lean }
 * @returns {Promise<Object|null>} - Inquiry document
 */
export const findInquiryById = async (id, { session = null, lean = true } = {}) => {
  try {
    let query = Inquiry.findById(id).session(session);
    query = query
      .populate({
        path: 'tenantId',
        select: 'name email phoneNumber avatar',
      })
      .populate({
        path: 'propertyId',
        select: 'title price type address images ratingAverage location',
      })
      .populate({
        path: 'ownerId',
        select: 'name email phoneNumber',
      });

    if (lean) query = query.lean();
    return await query;
  } catch (error) {
    logger.error(`Repository error in findInquiryById: ${error.message}`);
    throw error;
  }
};

/**
 * Checks if an active inquiry already exists for a property by the tenant.
 * Active states include 'pending', 'viewed', 'contacted', and 'visit_scheduled'.
 * 
 * @param {string} tenantId - Tenant identifier
 * @param {string} propertyId - Property identifier
 * @returns {Promise<Object|null>} - Active inquiry document if found
 */
export const findActiveInquiryForTenant = async (tenantId, propertyId) => {
  try {
    return await Inquiry.findOne({
      tenantId,
      propertyId,
      status: { $in: ['pending', 'viewed', 'contacted', 'visit_scheduled'] },
    }).lean();
  } catch (error) {
    logger.error(`Repository error in findActiveInquiryForTenant: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves paginated inquiries created by a tenant.
 * 
 * @param {string} tenantId - Tenant identifier
 * @param {number} skip - Offset skip
 * @param {number} limit - Pages limit
 * @returns {Promise<Object>} - Paginated data and metadata
 */
export const getTenantInquiries = async (tenantId, skip = 0, limit = 10) => {
  try {
    const inquiries = await Inquiry.find({ tenantId })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .populate({
        path: 'propertyId',
        select: 'title price type address images ratingAverage location',
        options: { slice: { images: 1 } },
      })
      .populate({
        path: 'ownerId',
        select: 'name email phoneNumber',
      })
      .sort({ createdAt: -1 })
      .lean();

    const total = await Inquiry.countDocuments({ tenantId });

    return { inquiries, total };
  } catch (error) {
    logger.error(`Repository error in getTenantInquiries: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves paginated inquiries received by an owner.
 * 
 * @param {string} ownerId - Owner identifier
 * @param {number} skip - Offset skip
 * @param {number} limit - Pages limit
 * @returns {Promise<Object>} - Paginated data and metadata
 */
export const getOwnerInquiries = async (ownerId, skip = 0, limit = 10) => {
  try {
    const inquiries = await Inquiry.find({ ownerId })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .populate({
        path: 'propertyId',
        select: 'title price type address images ratingAverage location',
        options: { slice: { images: 1 } },
      })
      .populate({
        path: 'tenantId',
        select: 'name email phoneNumber avatar',
      })
      .sort({ createdAt: -1 })
      .lean();

    const total = await Inquiry.countDocuments({ ownerId });

    return { inquiries, total };
  } catch (error) {
    logger.error(`Repository error in getOwnerInquiries: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves paginated inquiries for a specific property listing.
 * 
 * @param {string} propertyId - Property identifier
 * @param {number} skip - Offset skip
 * @param {number} limit - Pages limit
 * @returns {Promise<Object>} - Paginated data and metadata
 */
export const getPropertyInquiries = async (propertyId, skip = 0, limit = 10) => {
  try {
    const inquiries = await Inquiry.find({ propertyId })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .populate({
        path: 'tenantId',
        select: 'name email phoneNumber avatar',
      })
      .sort({ createdAt: -1 })
      .lean();

    const total = await Inquiry.countDocuments({ propertyId });

    return { inquiries, total };
  } catch (error) {
    logger.error(`Repository error in getPropertyInquiries: ${error.message}`);
    throw error;
  }
};

/**
 * Updates status, notes, or visits of an inquiry.
 * Supports transactional sessions.
 * 
 * @param {string} id - Inquiry identifier
 * @param {Object} updateData - Target data to patch
 * @param {Object} session - Mongoose transaction session
 * @returns {Promise<Object|null>} - Updated inquiry document
 */
export const updateInquiryStatus = async (id, updateData, session = null) => {
  try {
    return await Inquiry.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, session }
    );
  } catch (error) {
    logger.error(`Repository error in updateInquiryStatus: ${error.message}`);
    throw error;
  }
};

/**
 * Gathers count aggregates by status codes for an owner's listings.
 * 
 * @param {string} ownerId - Owner identifier
 * @returns {Promise<Object>} - Formatted status counts
 */
export const getInquiryStats = async (ownerId) => {
  try {
    const stats = await Inquiry.aggregate([
      { $match: { ownerId: new mongoose.Types.ObjectId(ownerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = stats.reduce(
      (acc, curr) => {
        if (curr._id) {
          acc[curr._id] = curr.count;
        }
        return acc;
      },
      {
        pending: 0,
        viewed: 0,
        contacted: 0,
        visit_scheduled: 0,
        accepted: 0,
        rejected: 0,
        completed: 0,
        cancelled: 0,
      }
    );

    return formatted;
  } catch (error) {
    logger.error(`Repository error in getInquiryStats: ${error.message}`);
    throw error;
  }
};

export default {
  createInquiry,
  findInquiryById,
  findActiveInquiryForTenant,
  getTenantInquiries,
  getOwnerInquiries,
  getPropertyInquiries,
  updateInquiryStatus,
  getInquiryStats,
};
