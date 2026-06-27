import express from 'express';
import { sendContactMessage } from '../controllers/contact.controller.js';
import { validateSchema } from '../middleware/validateMiddleware.js';
import { createContactSchema } from '../validators/contact.validator.js';

const router = express.Router();

/**
 * @route POST /api/v1/contact
 * @desc Create a new contact inquiry from users/visitors.
 * @access Public
 */
router.post('/send', validateSchema(createContactSchema), sendContactMessage);
router.post('/', validateSchema(createContactSchema), sendContactMessage);

export default router;

