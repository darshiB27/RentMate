import nodemailer from 'nodemailer';
import env from './env.js';
import logger from './logger.js';

// Setup email SMTP transport
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // True if SSL port, false if TLS/STARTTLS (587)
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Diagnostic check to verify mail SMTP settings are valid on startup
export const verifyMailConnection = async () => {
  if (!env.SMTP_PASS || env.SMTP_PASS === 'YOUR_GMAIL_APP_PASSWORD') {
    logger.warn('Nodemailer SMTP connection skipped: SMTP_PASS is not configured (using placeholder or empty). Outgoing mail features will not function.');
    return false;
  }
  try {
    console.log("Verifying transporter connection...");
    await transporter.verify();
    console.log("Transporter verification succeeded!");
    logger.info('Nodemailer SMTP Connection verified successfully!');
    return true;
  } catch (error) {
    console.error("Transporter verification failed!");
    console.error(error);
    if (error.response) console.error("SMTP Response:", error.response);
    if (error.code) console.error("SMTP Code:", error.code);
    logger.warn(`Nodemailer SMTP Connection failed: ${error.message}. Outgoing mail features will not function.`);
    return false;
  }
};

/**
 * Dispatches an email notification with full Winston tracking.
 * @param {Object} options - Email configuration: { to, subject, text, html }
 * @returns {Promise<Object>} - Resolves with Nodemailer info receipt metadata.
 */
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    console.log("Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent");
    console.log(info);
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Response:", info.response);

    logger.info(`Email sent successfully to ${options.to}! MsgID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email send failed!");
    console.error(error);
    if (error.response) console.error("SMTP Response:", error.response);
    if (error.code) console.error("SMTP Code:", error.code);
    logger.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
};


export default transporter;
