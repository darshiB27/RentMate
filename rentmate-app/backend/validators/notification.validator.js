import { z } from 'zod';

// Reusable MongoDB Hex ObjectId Validator
const objectIdSchema = z
  .string({ required_error: 'Notification identifier is required.' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier format.');

// Preprocess helper for parsing integer inputs
const coerceInt = (defValue) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defValue;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defValue : parsed;
  }, z.number().int().optional());

// Paginated query validations
export const notificationQuerySchema = z.object({
  page: coerceInt(1),
  limit: coerceInt(10),
});

// Route parameter validations
export const notificationParamsSchema = z.object({
  id: objectIdSchema,
});

export default {
  notificationQuerySchema,
  notificationParamsSchema,
};
