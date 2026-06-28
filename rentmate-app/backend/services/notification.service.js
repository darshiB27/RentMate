import notificationRepository from '../repositories/notification.repository.js';
import { emitToUser } from '../socket/socketServer.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';
import logger from '../config/logger.js';

/**
 * Creates, saves, and dispatches a new notification.
 * Supports transactional database sessions.
 * 
 * @param {string} userId - Target User ID recipient
 * @param {string} title - Title of notification
 * @param {string} message - Content message
 * @param {string} type - Notification code category: 'inquiry', 'property', 'review', 'verification', 'system'
 * @param {string} referenceId - Optional identifier referencing target action entity
 * @param {Object} session - Mongoose transaction session context
 * @returns {Promise<Object>} - Saved notification document
 */
export const createNotification = async (userId, title, message, type, referenceId = null, session = null) => {
  try {
    const validTypes = ['inquiry', 'property', 'review', 'verification', 'system'];
    if (!validTypes.includes(type)) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, `Invalid notification type: ${type}`);
    }

    const notificationData = {
      userId,
      title,
      message,
      type,
      referenceId: referenceId || undefined,
    };

    // Save database record
    const notification = await notificationRepository.createNotification(notificationData, session);

    // Dispatch Socket event asynchronously
    // Format payload for frontend consumption
    const socketPayload = {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      referenceId: notification.referenceId,
      createdAt: notification.createdAt,
    };
    
    emitToUser(userId, 'notification:new', socketPayload);

    return notification;
  } catch (error) {
    logger.error(`Service error in createNotification: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves paginated notifications list for a specific user.
 * 
 * @param {string} userId - Recipient User ID
 * @param {number} page - Target page index
 * @param {number} limit - Target page size limit
 * @returns {Promise<Object>} - Paginated data and pagination schema details
 */
export const getUserNotifications = async (userId, page = 1, limit = 10) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const { notifications, total } = await notificationRepository.getUserNotifications(userId, skip, parsedLimit);

  return {
    notifications,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Marks a single notification as read.
 * 
 * @param {string} userId - User ID requesting mark
 * @param {string} notificationId - Target Notification ID
 * @returns {Promise<Object>} - Updated notification document
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  const notification = await notificationRepository.markAsRead(userId, notificationId);
  
  if (!notification) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'The requested notification was not found or does not belong to you.');
  }

  return notification;
};

/**
 * Marks all unread notifications of a user as read.
 * 
 * @param {string} userId - Recipient User ID
 * @returns {Promise<Object>} - Confirmation status details
 */
export const markAllNotificationsAsRead = async (userId) => {
  await notificationRepository.markAllAsRead(userId);
  return { success: true, message: 'All notifications marked as read.' };
};

/**
 * Deletes a user notification.
 * 
 * @param {string} userId - User ID requesting deletion
 * @param {string} notificationId - Target Notification ID
 * @returns {Promise<Object>} - Deleted notification document
 */
export const deleteNotification = async (userId, notificationId) => {
  const notification = await notificationRepository.deleteNotification(userId, notificationId);

  if (!notification) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'The requested notification was not found or does not belong to you.');
  }

  return notification;
};

/**
 * Retrieves the count of unread notifications.
 * 
 * @param {string} userId - Target User ID
 * @returns {Promise<Object>} - Object carrying count code: { count: number }
 */
export const getUnreadCount = async (userId) => {
  const count = await notificationRepository.getUnreadCount(userId);
  return { count };
};

export default {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
};
