import { z } from 'zod';

const objectIdSchema = z
  .string({ required_error: 'Property identifier is required.' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid property identifier format.');

// Validate optional ISO date queries for stats filtering
export const dashboardQuerySchema = z.object({
  startDate: z
    .string()
    .datetime({ message: 'Start date must be a valid ISO datetime.' })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: 'End date must be a valid ISO datetime.' })
    .optional(),
  limit: z
    .preprocess((val) => (val ? parseInt(val, 10) : 5), z.number().int().min(1).max(20))
    .optional(),
});

export const propertyParamsSchema = z.object({
  propertyId: objectIdSchema,
});

export default {
  dashboardQuerySchema,
  propertyParamsSchema,
};
