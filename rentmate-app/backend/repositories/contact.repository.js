import Contact from '../models/contact.model.js';
import logger from '../config/logger.js';

/**
 * Creates and persists a new contact entry.
 * 
 * @param {Object} contactData - Contact payload details
 * @returns {Promise<Object>} - Saved contact document
 */
export const createContact = async (contactData) => {
  try {
    const contact = new Contact(contactData);
    return await contact.save();
  } catch (error) {
    logger.error(`Repository error in createContact: ${error.message}`);
    throw error;
  }
};

export default {
  createContact,
};
