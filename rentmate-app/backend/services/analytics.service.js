import crypto from 'crypto';
import analyticsRepository from '../repositories/analytics.repository.js';
import propertyRepository from '../repositories/property.repository.js';
import ApiError from '../utils/ApiError.js';
import STATUS_CODES from '../constants/statusCodes.js';
import logger from '../config/logger.js';

// Helper to hash IP address
const generateIpHash = (ip) => {
  return crypto.createHash('sha256').update(ip || 'unknown_ip').digest('hex');
};

// Helper to normalize Date to start of day (UTC)
const normalizeToStartOfDay = (dateInput) => {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Tracks property view metrics.
 * Uses SHA-256 IP hashing to enforce a 24-hour duplicate hit check.
 * 
 * @param {string} propertyId - Property listing identifier
 * @param {string} viewerId - Viewer user identifier (optional)
 * @param {string} clientIp - Client visitor IP address
 * @returns {Promise<boolean>} - True if logged view, false if bypassed duplicate
 */
export const trackView = async (propertyId, viewerId = null, clientIp = '') => {
  try {
    const ipHash = generateIpHash(clientIp);

    // Assert that the listing exists
    const property = await propertyRepository.findPropertyById(propertyId, { select: '_id' });
    if (!property) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, 'Property listing not found.');
    }

    // Check duplicate view inside last 24h
    const duplicate = await analyticsRepository.hasViewedInLast24Hours(propertyId, ipHash);
    if (duplicate) {
      logger.debug(`Bypassed duplicate view hit for Property ${propertyId} from IP hash ${ipHash}`);
      return false;
    }

    await analyticsRepository.createPropertyView({
      propertyId,
      viewerId: viewerId || undefined,
      ipHash,
    });

    await propertyRepository.updateProperty(propertyId, { $inc: { viewsCount: 1 } });

    logger.info(`Logged view for Property ${propertyId}`);
    return true;
  } catch (error) {
    logger.error(`Service error in trackView: ${error.message}`);
    throw error;
  }
};

/**
 * Dummy/stub function called inside the Inquiry Module.
 * Real analytics metrics are consolidated from raw collections daily via background jobs.
 */
export const trackInquiry = async (propertyId, tenantId, ownerId) => {
  logger.info(`[Analytics Service] Inquiry trigger logged: Property ${propertyId} by Tenant ${tenantId}`);
  return true;
};

/**
 * Compiles owner statistics dashboard metrics.
 * Calculates total views, inquiries, conversions, and formats a daily breakdown.
 * 
 * @param {string} ownerId - Owner identifier
 * @param {string} role - User role check
 * @param {string} start - Start date string
 * @param {string} end - End date string
 * @returns {Promise<Object>} - Consolidated owner metrics dashboard
 */
export const getOwnerDashboard = async (ownerId, role, start, end) => {
  if (role !== 'owner') {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. Only owners are allowed to view this dashboard.');
  }

  // Fallback to last 30 days if not provided
  const endDate = end ? normalizeToStartOfDay(end) : normalizeToStartOfDay(new Date());
  const startDate = start ? normalizeToStartOfDay(start) : normalizeToStartOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  const { summary, dailyBreakdown } = await analyticsRepository.getOwnerStats(ownerId, startDate, endDate);

  const views = summary.totalViews || 0;
  const inquiries = summary.totalInquiries || 0;
  const conversionRate = views > 0 ? parseFloat(((inquiries / views) * 100).toFixed(2)) : 0.0;

  return {
    startDate,
    endDate,
    summary: {
      ...summary,
      conversionRate,
    },
    dailyBreakdown,
  };
};

/**
 * Compiles global platform statistics dashboard metrics for administrators.
 * 
 * @param {string} role - User role check
 * @param {string} start - Start date string
 * @param {string} end - End date string
 * @returns {Promise<Object>} - Global platform metrics dashboard
 */
export const getAdminDashboard = async (role, start, end) => {
  if (role !== 'admin') {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Access denied. Administrator privileges required.');
  }

  const endDate = end ? normalizeToStartOfDay(end) : normalizeToStartOfDay(new Date());
  const startDate = start ? normalizeToStartOfDay(start) : normalizeToStartOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  const { summary } = await analyticsRepository.getAdminStats(startDate, endDate);

  const views = summary.totalViews || 0;
  const inquiries = summary.totalInquiries || 0;
  const conversionRate = views > 0 ? parseFloat(((inquiries / views) * 100).toFixed(2)) : 0.0;

  return {
    startDate,
    endDate,
    summary: {
      ...summary,
      conversionRate,
    },
  };
};

/**
 * Retrieves lists of top performing listings, popular localities, and cities.
 * 
 * @param {number} limit - Target list limits
 * @returns {Promise<Object>} - Consolidate top performs list
 */
export const getTopListings = async (limit = 5) => {
  try {
    const properties = await analyticsRepository.getTopProperties(limit);
    const localities = await analyticsRepository.getTopLocalities(limit);
    const cities = await analyticsRepository.getTopCities(limit);

    return {
      properties,
      localities,
      cities,
    };
  } catch (error) {
    logger.error(`Service error in getTopListings: ${error.message}`);
    throw error;
  }
};

/**
 * Aggregates raw log counts (views, inquiries, wishlists) and materializes daily records.
 * Called automatically by scheduled background cron jobs.
 * 
 * @param {Date} targetDate - Target day date boundary
 * @returns {Promise<Object>} - Bulk write report status
 */
export const compileDailyMetrics = async (targetDate = new Date()) => {
  try {
    // Compile metrics for the target day normalized to start of day
    // By default compile for the previous day if no date is specified
    const target = normalizeToStartOfDay(targetDate);
    
    // Normalize date to yesterday at 00:00:00
    target.setDate(target.getDate() - 1);

    logger.info(`Starting background daily analytics compilation for target date: ${target.toISOString()}`);
    
    const dailyMetrics = await analyticsRepository.compileDailyListingMetrics(target);
    const result = await analyticsRepository.saveDailyMetrics(dailyMetrics);

    logger.info(`Successfully completed daily analytics compilation. Upserted count: ${result.upsertedCount || 0}`);
    return result;
  } catch (error) {
    logger.error(`Service error in compileDailyMetrics: ${error.message}`);
    throw error;
  }
};

export default {
  trackView,
  trackInquiry,
  getOwnerDashboard,
  getAdminDashboard,
  getTopListings,
  compileDailyMetrics,
};
