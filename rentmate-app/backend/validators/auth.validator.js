import { z } from 'zod';

// --- REUSABLE PRIMITIVES ---

// Email schema rules with format checking and lowercase normalisation
export const emailSchema = z
  .string({ required_error: 'Email address is required' })
  .trim()
  .min(1, 'Email address cannot be empty')
  .email('Please provide a valid email format')
  .toLowerCase();

// Strong password security validation: min 8, max 128, casing, digit, and symbol lookaheads
export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[@$!%*?&#]/, 'Password must contain at least one special character (@$!%*?&#)');

// Standard E.164 phone verification pattern
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Phone number must be in a valid E.164 format (e.g. +919876543210)');

// --- SCHEMAS FOR CONTROLLER CHANNELS ---

// Register request validation schema
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: emailSchema,
  password: passwordSchema,
  phoneNumber: phoneSchema.optional().or(z.literal('')),
  role: z
    .enum(['tenant', 'owner'], {
      errorMap: () => ({ message: 'Role must be either tenant or owner' }),
    })
    .default('tenant'),
});

// Login request validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password field cannot be empty'),
});

// Google token assertion validation
export const googleLoginSchema = z.object({
  googleId: z
    .string({ required_error: 'Google ID key is required' })
    .min(1, 'Google ID key cannot be empty'),
  email: emailSchema,
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty'),
  avatar: z.string().url('Avatar must be a valid image URL').optional(),
  role: z.enum(['tenant', 'owner']).optional().default('tenant'),
});

// Forgot password query schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password verification schema with confirmation matching logic
export const resetPasswordSchema = z
  .object({
    token: z
      .string({ required_error: 'Reset token is required' })
      .min(1, 'Token cannot be empty'),
    password: passwordSchema,
    confirmPassword: z
      .string({ required_error: 'Confirmation password is required' })
      .min(1, 'Confirmation password cannot be empty'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match. Please verify.',
    path: ['confirmPassword'],
  });

// Verify email confirmation schema
export const verifyEmailSchema = z.object({
  token: z
    .string({ required_error: 'Verification token is required' })
    .min(1, 'Verification token cannot be empty'),
});

// Refresh token retrieval schema
export const refreshTokenSchema = z.object({
  token: z
    .string({ required_error: 'Refresh token is required' })
    .min(1, 'Refresh token cannot be empty'),
});
