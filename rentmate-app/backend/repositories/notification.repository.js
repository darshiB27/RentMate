import Notification from '../models/notification.model.js';
import logger from '../config/logger.js';

/**
 * Creates and persists a new user notification.
 * Supports transactional sessions.
 * 
 * @param {Object} data - Notification fields (userId, title, message, type, referenceId)
 * @param {Object} session - Mongoose transaction session
 * @returns {Promise<Object>} - Saved notification document
 */
export const createNotification = async (data, session = null) => {
  try {
    const notification = new Notification(data);
    return await notification.save({ session });
  } catch (error) {
    logger.error(`Repository error in createNotification: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves a paginated list of notifications for a user, sorted descending.
 * 
 * @param {string} userId - Recipient User ID
 * @param {number} skip - Offset skip
 * @param {number} limit - Page size limit
 * @returns {Promise<Object>} - List of notifications and total count matching user
 */
export const getUserNotifications = async (userId, skip = 0, limit = 10) => {
  try {
    const notifications = await Notification.find({ userId })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Notification.countDocuments({ userId });

    return { notifications, total };
  } catch (error) {
    logger.error(`Repository error in getUserNotifications: ${error.message}`);
    throw error;
  }
};

/**
 * Marks a specific notification as read, ensuring it belongs to the requesting user.
 * 
 * @param {string} userId - User ID requesting update
 * @param {string} notificationId - Notification ID
 * @param {Object} session - Mongoose transaction session
 * @returns {Promise<Object|null>} - Updated notification document or null
 */
export const markAsRead = async (userId, notificationId, session = null) => {
  try {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true, session }
    );
  } catch (error) {
    logger.error(`Repository error in markAsRead: ${error.message}`);
    throw error;
  }
};

/**
 * Marks all unread notifications as read for a given user.
 * 
 * @param {string} userId - Recipient User ID
 * @param {Object} session - Mongoose transaction session
 * @returns {Promise<Object>} - Update summary result details
 */
export const markAllAsRead = async (userId, session = null) => {
  try {
    return await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
      { session }
    );
  } catch (error) {
    logger.error(`Repository error in markAllAsRead: ${error.message}`);
    throw error;
  }
};

/**
 * Deletes a specific notification, ensuring it belongs to the requesting user.
 * 
 * @param {string} userId - User ID requesting deletion
 * @param {string} notificationId - Notification ID to delete
 * @param {Object} session - Mongoose transaction session
 * @returns {Promise<Object|null>} - Deleted notification document or null
 */
export const deleteNotification = async (userId, notificationId, session = null) => {
  try {
    return await Notification.findOneAndDelete(
      { _id: notificationId, userId },
      { session }
    );
  } catch (error) {
    logger.error(`Repository error in deleteNotification: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves the count of unread notifications for a user.
 * 
 * @param {string} userId - Recipient User ID
 * @returns {Promise<number>} - Count of unread notifications
 */
export const getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({ userId, isRead: false });
  } catch (error) {
    logger.error(`Repository error in getUnreadCount: ${error.message}`);
    throw error;
  }
};

export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
