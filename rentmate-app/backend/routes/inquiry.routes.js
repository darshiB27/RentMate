import express from 'express';
import {
  createInquiry,
  getMyInquiries,
  getPropertyInquiries,
  getInquiryById,
  updateInquiryStatus,
  scheduleVisit,
  acceptInquiry,
  rejectInquiry,
  cancelInquiry,
  getDashboardStats,
} from '../controllers/inquiry.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateSchema, validateQuery, validateParams } from '../middleware/validateMiddleware.js';
import {
  createInquirySchema,
  updateInquiryStatusSchema,
  scheduleVisitSchema,
  acceptOrRejectSchema,
  cancelInquirySchema,
  inquiryQuerySchema,
  inquiryParamsSchema,
  propertyParamsSchema,
} from '../validators/inquiry.validator.js';

const router = express.Router();

// Enforce JWT authentication on all inquiry endpoints
router.use(verifyJWT);

/**
 * @route POST /api/v1/inquiries
 * @desc Create a new property inquiry.
 * @access Tenant Only
 */
router.post('/', authorizeRoles('tenant'), validateSchema(createInquirySchema), createInquiry);

/**
 * @route GET /api/v1/inquiries/me
 * @desc Retrieve current user's paginated inquiries.
 * @access Private (Tenant or Owner)
 */
router.get('/me', validateQuery(inquiryQuerySchema), getMyInquiries);

/**
 * @route GET /api/v1/inquiries/stats/dashboard
 * @desc Retrieve owner inquiries dashboard counts statistics.
 * @access Owner Only
 */
router.get('/stats/dashboard', authorizeRoles('owner'), getDashboardStats);

/**
 * @route GET /api/v1/inquiries/property/:propertyId
 * @desc Retrieve paginated inquiries for a specific property listing.
 * @access Owner Only
 */
router.get('/property/:propertyId', authorizeRoles('owner'), validateParams(propertyParamsSchema), validateQuery(inquiryQuerySchema), getPropertyInquiries);

/**
 * @route GET /api/v1/inquiries/:id
 * @desc Retrieve inquiry details by ID.
 * @access Private (Tenant, Owner, or Admin)
 */
router.get('/:id', validateParams(inquiryParamsSchema), getInquiryById);

/**
 * @route PATCH /api/v1/inquiries/:id/status
 * @desc Update inquiry status and notes directly.
 * @access Private (Tenant or Owner)
 */
router.patch('/:id/status', validateParams(inquiryParamsSchema), validateSchema(updateInquiryStatusSchema), updateInquiryStatus);

/**
 * @route PATCH /api/v1/inquiries/:id/schedule
 * @desc Schedule a visit date for the listing.
 * @access Owner Only
 */
router.patch('/:id/schedule', authorizeRoles('owner'), validateParams(inquiryParamsSchema), validateSchema(scheduleVisitSchema), scheduleVisit);

/**
 * @route PATCH /api/v1/inquiries/:id/accept
 * @desc Accept the inquiry.
 * @access Owner Only
 */
router.patch('/:id/accept', authorizeRoles('owner'), validateParams(inquiryParamsSchema), validateSchema(acceptOrRejectSchema), acceptInquiry);

/**
 * @route PATCH /api/v1/inquiries/:id/reject
 * @desc Reject the inquiry.
 * @access Owner Only
 */
router.patch('/:id/reject', authorizeRoles('owner'), validateParams(inquiryParamsSchema), validateSchema(acceptOrRejectSchema), rejectInquiry);

/**
 * @route PATCH /api/v1/inquiries/:id/cancel
 * @desc Cancel the inquiry.
 * @access Tenant Only
 */
router.patch('/:id/cancel', authorizeRoles('tenant'), validateParams(inquiryParamsSchema), validateSchema(cancelInquirySchema), cancelInquiry);

export default router;
