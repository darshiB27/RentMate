import propertyRepository from '../repositories/property.repository.js';
import { uploadFromBuffer } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';
import logger from '../config/logger.js';

// Enforce role restrictions
const assertIsOwner = (role) => {
  if (role !== 'owner' && role !== 'admin') {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      'Access denied. Only property owners or admins are permitted to perform this action.'
    );
  }
};

const assertIsAdmin = (role) => {
  if (role !== 'admin') {
    throw new ApiError(
      STATUS_CODES.FORBIDDEN,
      'Access denied. Administrator privileges required.'
    );
  }
};

/**
 * Uploads a list of file buffers to Cloudinary.
 * 
 * @param {Array} files - Multer file buffers list
 * @returns {Promise<Array>} - Secure Cloudinary URLs list
 */
const uploadPropertyImages = async (files) => {
  if (!files || files.length === 0) return [];
  
  try {
    const uploadPromises = files.map((file) => uploadFromBuffer(file.buffer, 'rentmate/properties'));
    const results = await Promise.all(uploadPromises);
    return results.map((res) => res.secure_url);
  } catch (error) {
    logger.error(`Failed to upload property images to Cloudinary: ${error.message}`);
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Failed to process and upload property images.');
  }
};

/**
 * Creates a new property listing.
 * Uploads local memory buffers to Cloudinary.
 * 
 * @param {string} ownerId - Owner identifier
 * @param {string} role - User role
 * @param {Object} payload - Property parameters
 * @param {Array} files - Uploaded file buffers
 * @returns {Promise<Object>} - Saved property document
 */
export const createProperty = async (ownerId, role, payload, files) => {
  assertIsOwner(role);

  // Upload image buffers to Cloudinary
  const imageUrls = await uploadPropertyImages(files);
  if (imageUrls.length === 0) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'At least one property image is required.');
  }

  const { title, description, price, type, sharingType, genderCategory, amenities, longitude, latitude, address } = payload;

  const propertyData = {
    ownerId,
    title,
    description,
    price,
    type,
    sharingType,
    genderCategory,
    amenities,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    },
    address,
    images: imageUrls,
  };

  return await propertyRepository.createProperty(propertyData);
};

/**
 * Retrieves detailed listing by its Object ID.
 */
export const getPropertyById = async (id) => {
  const property = await propertyRepository.findPropertyById(id, { lean: true });
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }
  return property;
};

/**
 * Retrieves detailed listing by its unique slug.
 */
export const getPropertyBySlug = async (slug) => {
  const property = await propertyRepository.findPropertyBySlug(slug, { lean: true });
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }
  return property;
};

/**
 * Updates an existing property listing.
 */
export const updateProperty = async (ownerId, role, propertyId, payload, files) => {
  assertIsOwner(role);

  const property = await propertyRepository.findPropertyById(propertyId, { lean: false });
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }

  // Assert ownership
  if (property.ownerId._id.toString() !== ownerId.toString() && role !== 'admin') {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You do not own this listing.');
  }

  const updateData = { ...payload };

  // If new images are uploaded, upload them and merge with existing images
  if (files && files.length > 0) {
    const newImageUrls = await uploadPropertyImages(files);
    updateData.images = [...(property.images || []), ...newImageUrls];
  }

  // Check if coordinates are updated
  if (payload.longitude && payload.latitude) {
    updateData.location = {
      type: 'Point',
      coordinates: [parseFloat(payload.longitude), parseFloat(payload.latitude)],
    };
    delete updateData.longitude;
    delete updateData.latitude;
  }

  return await propertyRepository.updateProperty(propertyId, updateData);
};

/**
 * Soft deletes a property listing.
 */
export const deleteProperty = async (ownerId, role, propertyId) => {
  assertIsOwner(role);

  const property = await propertyRepository.findPropertyById(propertyId, { lean: false });
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }

  // Assert ownership
  if (property.ownerId._id.toString() !== ownerId.toString() && role !== 'admin') {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You do not own this listing.');
  }

  return await propertyRepository.deleteProperty(propertyId);
};

/**
 * Gets property listings owned by the logged-in user.
 */
export const getOwnerProperties = async (ownerId, role, page = 1, limit = 10) => {
  assertIsOwner(role);
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const { properties, total } = await propertyRepository.getOwnerProperties(ownerId, skip, parsedLimit);

  return {
    properties,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Fetches approved featured listings.
 */
export const getFeaturedProperties = async (page = 1, limit = 10) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const { properties, total } = await propertyRepository.getFeaturedProperties(skip, parsedLimit);

  return {
    properties,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Fetches approved trending listings.
 */
export const getTrendingProperties = async (page = 1, limit = 10) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;

  const { properties, total } = await propertyRepository.getTrendingProperties(skip, parsedLimit);

  return {
    properties,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Fetches nearby approved listings.
 */
export const getNearbyProperties = async (longitude, latitude, maxDistance = 5000, page = 1, limit = 10) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;
  const skip = (parsedPage - 1) * parsedLimit;
  const coords = [parseFloat(longitude), parseFloat(latitude)];

  const { properties, total } = await propertyRepository.getNearbyProperties(coords, parseInt(maxDistance, 10), skip, parsedLimit);

  return {
    properties,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Owner updates availabilityStatus of a property.
 */
export const updateAvailabilityStatus = async (ownerId, role, propertyId, status) => {
  assertIsOwner(role);

  const property = await propertyRepository.findPropertyById(propertyId, { select: 'ownerId' });
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }

  // Assert ownership
  if (property.ownerId.toString() !== ownerId.toString() && role !== 'admin') {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. You do not own this listing.');
  }

  return await propertyRepository.updateProperty(propertyId, { availabilityStatus: status });
};

/**
 * Admin approves property verification.
 */
export const approveProperty = async (adminId, role, propertyId) => {
  assertIsAdmin(role);
  
  const property = await propertyRepository.findPropertyById(propertyId, { select: 'verificationStatus' });
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }

  return await propertyRepository.updateProperty(propertyId, { verificationStatus: 'approved' });
};

/**
 * Admin rejects property verification.
 */
export const rejectProperty = async (adminId, role, propertyId) => {
  assertIsAdmin(role);
  
  const property = await propertyRepository.findPropertyById(propertyId, { select: 'verificationStatus' });
  if (!property) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
  }

  return await propertyRepository.updateProperty(propertyId, { verificationStatus: 'rejected' });
};

export default {
  createProperty,
  getPropertyById,
  getPropertyBySlug,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
  getFeaturedProperties,
  getTrendingProperties,
  getNearbyProperties,
  updateAvailabilityStatus,
  approveProperty,
  rejectProperty,
};
