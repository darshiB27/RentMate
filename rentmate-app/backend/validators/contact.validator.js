import { z } from 'zod';

export const createContactSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name cannot exceed 100 characters.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Invalid email address format.'),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  subject: z
    .string({ required_error: 'Subject is required.' })
    .trim()
    .min(3, 'Subject must be at least 3 characters.')
    .max(200, 'Subject cannot exceed 200 characters.'),
  message: z
    .string({ required_error: 'Message is required.' })
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(2000, 'Message cannot exceed 2000 characters.'),
});
