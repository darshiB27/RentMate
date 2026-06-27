import express from 'express';
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notification.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validateQuery, validateParams } from '../middleware/validateMiddleware.js';
import {
  notificationQuerySchema,
  notificationParamsSchema,
} from '../validators/notification.validator.js';

const router = express.Router();

// Enforce JWT authentication on all notification endpoints
router.use(verifyJWT);

/**
 * @route GET /api/v1/notifications
 * @desc Retrieve paginated notifications list for current authenticated user.
 * @access Private
 */
router.get('/', validateQuery(notificationQuerySchema), getNotifications);

/**
 * @route GET /api/v1/notifications/unread/count
 * @desc Fetch unread count for current user.
 * @access Private
 */
router.get('/unread/count', getUnreadCount);

/**
 * @route PATCH /api/v1/notifications/read-all
 * @desc Mark all notifications of current user as read.
 * @access Private
 */
router.patch('/read-all', markAllRead);

/**
 * @route PATCH /api/v1/notifications/:id/read
 * @desc Mark a single notification as read.
 * @access Private
 */
router.patch('/:id/read', validateParams(notificationParamsSchema), markRead);

/**
 * @route DELETE /api/v1/notifications/:id
 * @desc Delete a specific notification.
 * @access Private
 */
router.delete('/:id', validateParams(notificationParamsSchema), deleteNotification);

export default router;
