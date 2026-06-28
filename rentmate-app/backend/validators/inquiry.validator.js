import { z } from 'zod';

// Reusable MongoDB Hex ObjectId Validator
const objectIdSchema = z
  .string({ required_error: 'Identifier is required.' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier format.');

// Helper to parse query parameters into numbers
const coerceInt = (defValue) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defValue;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defValue : parsed;
  }, z.number().int().optional());

// Create Inquiry Schema
export const createInquirySchema = z.object({
  propertyId: objectIdSchema,
  message: z
    .string({ required_error: 'Message is required.' })
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(1000, 'Message cannot exceed 1000 characters.'),
  phoneNumber: z
    .string({ required_error: 'Phone number is required.' })
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Phone number must be in a valid E.164 format (e.g. +919876543210).'),
  preferredVisitDate: z
    .string()
    .datetime({ message: 'Preferred visit date must be a valid ISO datetime format.' })
    .optional()
    .or(z.date().optional()),
});

// Update Inquiry Status Schema
export const updateInquiryStatusSchema = z.object({
  status: z.enum(['pending', 'viewed', 'contacted', 'accepted', 'rejected', 'completed', 'cancelled'], {
    required_error: 'Status is required.',
  }),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters.').optional(),
});

// Schedule Visit Schema
export const scheduleVisitSchema = z.object({
  visitDate: z
    .string({ required_error: 'Visit date is required.' })
    .datetime({ message: 'Visit date must be a valid ISO datetime.' }),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters.').optional(),
});

// Accept/Reject Schema
export const acceptOrRejectSchema = z.object({
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters.').optional(),
});

// Cancel Schema
export const cancelInquirySchema = z.object({
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters.').optional(),
});

// Paginated Query Schema
export const inquiryQuerySchema = z.object({
  page: coerceInt(1),
  limit: coerceInt(10),
});

// URL Param Schema
export const inquiryParamsSchema = z.object({
  id: objectIdSchema,
});

export const propertyParamsSchema = z.object({
  propertyId: objectIdSchema,
});
