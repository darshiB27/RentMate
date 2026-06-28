import { z } from 'zod';

// MongoDB Hexadecimal 24-character ObjectId pattern check
const objectIdSchema = z
  .string({ required_error: 'Property identifier (propertyId) is required' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid property identifier format.');

// Helper to coerce string queries into integers safely
const coerceInt = (defValue) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defValue;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defValue : parsed;
  }, z.number().int().optional());

// Validator for request bodies: POST /wishlist and POST /wishlist/toggle
export const wishlistPropertySchema = z.object({
  propertyId: objectIdSchema,
});

// Validator for paginated queries: GET /wishlist
export const wishlistQuerySchema = z.object({
  page: coerceInt(1),
  limit: coerceInt(10),
});

// Validator for route URL parameters: DELETE /:propertyId, GET /check/:propertyId, GET /count/:propertyId
export const wishlistParamsSchema = z.object({
  propertyId: objectIdSchema,
});
