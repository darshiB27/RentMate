import { saveContactAndNotify } from '../services/contact.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import STATUS_CODES from '../constants/statusCodes.js';

/**
 * Handles guest contact submissions.
 */
export const sendContactMessage = asyncHandler(async (req, res) => {
  await saveContactAndNotify(req.body);
  return res
    .status(200)
    .json({
      success: true,
    });
});


export default {
  sendContactMessage,
};

