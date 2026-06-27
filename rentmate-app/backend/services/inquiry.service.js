import executeTransaction from '../utils/executeTransaction.js';
import inquiryRepository from '../repositories/inquiry.repository.js';
import propertyRepository from '../repositories/property.repository.js';
import { findUserById } from '../repositories/auth.repository.js';
import notificationService from './notification.service.js';
import analyticsService from './analytics.service.js';
import { sendEmail } from '../config/nodemailer.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';
import logger from '../config/logger.js';

// Enforce role restrictions
const assertIsTenant = (role) => {
  if (role !== 'tenant') {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      'Access denied. Only tenants are permitted to submit inquiries.'
    );
  }
};

const assertIsOwner = (role) => {
  if (role !== 'owner') {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      'Access denied. Only property owners are permitted to moderate inquiries.'
    );
  }
};

// Check if property is approved and not deleted
const assertPropertyInquirable = (property) => {
  if (!property || property.isDeleted === true || property.verificationStatus !== 'approved' || property.availabilityStatus !== 'available') {
    throw new ApiError(
      STATUS_CODES.NOT_FOUND,
      'The requested property listing is either unapproved, occupied, or deleted.'
    );
  }
};


/**
 * Creates a new property inquiry.
 * Executes within transaction block, creating notifications and triggering emails.
 * 
 * @param {string} tenantId - Tenant identifier
 * @param {string} role - User role
 * @param {Object} payload - Inquiry payload (propertyId, message, phoneNumber, preferredVisitDate)
 * @returns {Promise<Object>} - Saved inquiry details
 */
export const createInquiry = async (tenantId, role, payload) => {
  assertIsTenant(role);
  const { propertyId, message, phoneNumber, preferredVisitDate } = payload;

  // 1. Fetch tenant detail
  const tenant = await findUserById(tenantId, { select: 'name email' });
  if (!tenant) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Tenant account session is invalid.');
  }

  // 2. Fetch property and assert inquirable state
  const property = await propertyRepository.findPropertyById(propertyId, { select: '+isDeleted' });
  assertPropertyInquirable(property);

  // 3. Owners cannot submit inquiries on their own properties
  if (property.ownerId.toString() === tenantId.toString()) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      'Operation denied. You cannot submit inquiries on properties you own.'
    );
  }

  // 4. Assert only one active inquiry per property per tenant
  const activeInquiry = await inquiryRepository.findActiveInquiryForTenant(tenantId, propertyId);
  if (activeInquiry) {
    throw new ApiError(
      STATUS_CODES.CONFLICT,
      'You already have an active inquiry in progress for this property listing.'
    );
  }

  // 5. Execute transaction session
  const savedInquiry = await executeTransaction(async (session) => {
    const inquiryData = {
      tenantId,
      ownerId: property.ownerId,
      propertyId,
      message,
      phoneNumber,
      preferredVisitDate: preferredVisitDate ? new Date(preferredVisitDate) : undefined,
    };

    // Save inquiry record
    const inquiry = await inquiryRepository.createInquiry(inquiryData, session);

    // Create system notification for property owner
    await notificationService.createNotification(
      property.ownerId,
      'New Inquiry Received',
      `Tenant ${tenant.name} has inquired about your property "${property.title}".`,
      'inquiry',
      inquiry._id,
      session
    );

    return inquiry;
  });

  // 6. Trigger Asynchronous Notifications and Email dispatches (outside transaction to avoid delays)
  // Fetch owner data
  const owner = await findUserById(property.ownerId, { select: 'email name' });
  if (owner) {
    sendEmail({
      to: owner.email,
      subject: `[RentMate] New Property Inquiry: ${property.title}`,
      text: `Hello ${owner.name},\n\nYou have received a new inquiry from tenant ${tenant.name} for your property "${property.title}".\n\nMessage: "${message}"\nContact Phone: ${phoneNumber}\n\nPlease log in to your owner dashboard to manage this inquiry.\n\nBest regards,\nRentMate Support Team`,
    }).catch((emailErr) => logger.error(`Email dispatch alert failure: ${emailErr.message}`));
  }

  // Increment analytics count
  analyticsService.trackInquiry(propertyId, tenantId, property.ownerId).catch((anErr) =>
    logger.error(`Analytics inquiry logging failure: ${anErr.message}`)
  );

  return savedInquiry;
};

/**
 * Retrieves details for a specific inquiry. Permissions assert tenant or owner access only.
 */
export const getInquiryById = async (userId, role, inquiryId) => {
  const inquiry = await inquiryRepository.findInquiryById(inquiryId, { lean: true });
  if (!inquiry) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'The requested inquiry does not exist.');
  }

  // Enforce access authorization bounds
  const isTenant = inquiry.tenantId._id.toString() === userId.toString();
  const isOwner = inquiry.ownerId._id.toString() === userId.toString();
  const isAdmin = role === 'admin';

  if (!isTenant && !isOwner && !isAdmin) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You do not possess permissions to view this inquiry.');
  }

  return inquiry;
};

/**
 * Tenant retrieves their own inquiries.
 */
export const getTenantInquiries = async (tenantId, role, page = 1, limit = 10) => {
  assertIsTenant(role);
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const { inquiries, total } = await inquiryRepository.getTenantInquiries(tenantId, skip, parsedLimit);

  return {
    inquiries,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Owner retrieves inquiries received for their properties.
 */
export const getOwnerInquiries = async (ownerId, role, page = 1, limit = 10) => {
  assertIsOwner(role);
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const { inquiries, total } = await inquiryRepository.getOwnerInquiries(ownerId, skip, parsedLimit);

  return {
    inquiries,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Owner retrieves inquiries targeting a specific property listing.
 */
export const getPropertyInquiries = async (ownerId, role, propertyId, page = 1, limit = 10) => {
  assertIsOwner(role);
  
  // Verify that the owner actually owns this listing
  const property = await propertyRepository.findPropertyById(propertyId, { select: 'ownerId' });
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }
  if (property.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You do not own this property listing.');
  }

  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const { inquiries, total } = await inquiryRepository.getPropertyInquiries(propertyId, skip, parsedLimit);

  return {
    inquiries,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Updates status of an inquiry.
 */
export const updateInquiryStatus = async (userId, role, inquiryId, status, notes = '') => {
  const inquiry = await getInquiryById(userId, role, inquiryId);

  // Status transitions from final state (completed, cancelled, rejected) are blocked
  const finalStates = ['completed', 'cancelled', 'rejected'];
  if (finalStates.includes(inquiry.status)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, `Inquiry state transition blocked. Inquiry is already in a finalized state: "${inquiry.status}".`);
  }

  // Tenant is only allowed to transition to 'cancelled'
  if (role === 'tenant') {
    if (inquiry.tenantId._id.toString() !== userId.toString()) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You do not own this inquiry.');
    }
    if (status !== 'cancelled') {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Tenants are only permitted to transition inquiry status to "cancelled".');
    }
  }

  // Owner permissions
  if (role === 'owner') {
    if (inquiry.ownerId._id.toString() !== userId.toString()) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You do not own the property listing for this inquiry.');
    }
    if (status === 'cancelled') {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Property owners cannot set inquiry status to "cancelled".');
    }
  }

  // Execute status update with transaction
  const updatedInquiry = await executeTransaction(async (session) => {
    const doc = await inquiryRepository.updateInquiryStatus(inquiryId, { status, notes }, session);
    
    // Notify the other party
    const targetUserId = role === 'tenant' ? inquiry.ownerId._id : inquiry.tenantId._id;
    const title = 'Inquiry Status Updated';
    const message = `The status of the inquiry has been updated to "${status.replace('_', ' ')}".`;

    await notificationService.createNotification(
      targetUserId,
      title,
      message,
      'inquiry',
      inquiryId,
      session
    );

    return doc;
  });

  // Send email alerts asynchronously
  const alertEmail = role === 'tenant' ? inquiry.ownerId.email : inquiry.tenantId.email;
  const alertName = role === 'tenant' ? inquiry.ownerId.name : inquiry.tenantId.name;
  
  sendEmail({
    to: alertEmail,
    subject: `[RentMate] Inquiry Status Update Alert`,
    text: `Hello ${alertName},\n\nThe inquiry status has been changed to "${status.replace('_', ' ')}".\n\nNotes: "${notes || 'No comments left.'}"\n\nPlease log in to review the update.\n\nBest regards,\nRentMate Support`,
  }).catch((emailErr) => logger.error(`Email dispatch status alert failure: ${emailErr.message}`));

  return updatedInquiry;
};

/**
 * Schedules a visit for the listing.
 */
export const scheduleVisit = async (ownerId, role, inquiryId, visitDate, notes = '') => {
  assertIsOwner(role);
  const inquiry = await getInquiryById(ownerId, role, inquiryId);

  if (inquiry.ownerId._id.toString() !== ownerId.toString()) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You do not own the listing associated with this inquiry.');
  }

  const updatedInquiry = await executeTransaction(async (session) => {
    const doc = await inquiryRepository.updateInquiryStatus(
      inquiryId,
      { status: 'visit_scheduled', visitDate: new Date(visitDate), notes },
      session
    );

    await notificationService.createNotification(
      inquiry.tenantId._id,
      'Property Visit Scheduled',
      `A visit has been scheduled for "${inquiry.propertyId.title}" on ${new Date(visitDate).toLocaleDateString()}.`,
      'inquiry',
      inquiryId,
      session
    );

    return doc;
  });

  // Notify tenant via email
  sendEmail({
    to: inquiry.tenantId.email,
    subject: `[RentMate] Visit Scheduled: ${inquiry.propertyId.title}`,
    text: `Hello ${inquiry.tenantId.name},\n\nA visit for the listing "${inquiry.propertyId.title}" has been scheduled for:\nDate: ${new Date(visitDate).toLocaleDateString()}\nNotes: "${notes}"\n\nBest regards,\nRentMate Support`,
  }).catch((err) => logger.error(`Email visit notification error: ${err.message}`));

  return updatedInquiry;
};

/**
 * Owner accepts inquiry.
 */
export const acceptInquiry = async (ownerId, role, inquiryId, notes = '') => {
  return await updateInquiryStatus(ownerId, role, inquiryId, 'accepted', notes);
};

/**
 * Owner rejects inquiry.
 */
export const rejectInquiry = async (ownerId, role, inquiryId, notes = '') => {
  return await updateInquiryStatus(ownerId, role, inquiryId, 'rejected', notes);
};

/**
 * Tenant cancels inquiry.
 */
export const cancelInquiry = async (tenantId, role, inquiryId, notes = '') => {
  return await updateInquiryStatus(tenantId, role, inquiryId, 'cancelled', notes);
};

/**
 * Owner retrieves inquiries status dashboard metrics counts.
 */
export const getOwnerDashboardStats = async (ownerId, role) => {
  assertIsOwner(role);
  return await inquiryRepository.getInquiryStats(ownerId);
};

export default {
  createInquiry,
  getInquiryById,
  getTenantInquiries,
  getOwnerInquiries,
  getPropertyInquiries,
  updateInquiryStatus,
  scheduleVisit,
  acceptInquiry,
  rejectInquiry,
  cancelInquiry,
  getOwnerDashboardStats,
};
