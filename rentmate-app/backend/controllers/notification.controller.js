import notificationService from '../services/notification.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import STATUS_CODES from '../constants/statusCodes.js';

/**
 * Handles fetching paginated notifications for the authenticated user.
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await notificationService.getUserNotifications(req.user.id, page, limit);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Notifications fetched successfully.'));
});

/**
 * Handles marking a specific notification as read.
 */
export const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await notificationService.markNotificationAsRead(req.user.id, id);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Notification marked as read successfully.'));
});

/**
 * Handles marking all notifications of the user as read.
 */
export const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsAsRead(req.user.id);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'All notifications marked as read.'));
});

/**
 * Handles deleting a specific notification.
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await notificationService.deleteNotification(req.user.id, id);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Notification deleted successfully.'));
});

/**
 * Handles fetching the total count of unread notifications for the user.
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);
  return res
    .status(STATUS_CODES.OK)
    .json(new ApiResponse(STATUS_CODES.OK, result, 'Unread notification count retrieved successfully.'));
});

export default {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  getUnreadCount,
};
