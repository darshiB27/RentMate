import { createContact } from '../repositories/contact.repository.js';
import { sendEmail } from '../config/nodemailer.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

/**
 * Persists contact details and dispatches email notification.
 * 
 * @param {Object} contactData - Contact payload
 * @returns {Promise<Object>} - Persisted contact document
 */
export const saveContactAndNotify = async (contactData) => {
  // 1. Persist message in database
  const contact = await createContact(contactData);

  // 2. Dispatch email notification to support/administrator
  try {
    const supportEmail = env.SMTP_USER; // Send notification to the SMTP User
    const subject = `New Contact Form Submission: ${contact.subject}`;
    
    const textContent = `
You have received a new contact form submission on RentMate.

Details:
------------------------------------------
Name:    ${contact.name}
Email:   ${contact.email}
Phone:   ${contact.phone || 'N/A'}
Subject: ${contact.subject}
Date:    ${contact.createdAt}

Message:
${contact.message}
------------------------------------------
    `;

    const htmlContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
    <h2 style="margin: 0; font-size: 24px;">New Contact Submission</h2>
  </div>
  <div style="padding: 24px; background-color: #ffffff;">
    <p>A user has submitted a message via the RentMate Contact Page.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
        <td style="padding: 8px 0;">${contact.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Email:</td>
        <td style="padding: 8px 0;"><a href="mailto:${contact.email}">${contact.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
        <td style="padding: 8px 0;">${contact.phone || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
        <td style="padding: 8px 0; font-weight: bold; color: #4f46e5;">${contact.subject}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
        <td style="padding: 8px 0;">${contact.createdAt}</td>
      </tr>
    </table>
    <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 4px;">
      <p style="margin: 0; font-weight: bold; margin-bottom: 8px;">Message:</p>
      <p style="margin: 0; white-space: pre-wrap;">${contact.message}</p>
    </div>
  </div>
  <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
    This is an automated notification from RentMate Support.
  </div>
</div>
    `;

    await sendEmail({
      to: supportEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });
  } catch (error) {
    logger.error(`Contact email notification failed to send:`, error);
    throw error;
  }

  return contact;
};


export default {
  saveContactAndNotify,
};
