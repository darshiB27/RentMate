import { z } from 'zod';
import dotenv from 'dotenv';
import logger from './logger.js';

// Initialize env extraction
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url(),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(8, "JWT_ACCESS_SECRET must be at least 8 characters"),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(8, "JWT_REFRESH_SECRET must be at least 8 characters"),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().email("SMTP_USER must be a valid email"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:5000/api/v1/auth/google/callback'),
});

let env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorDetails = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    logger.error(`Environment variable validation failed! Validation errors: ${errorDetails}`);
  } else {
    logger.error('Unexpected error parsing environment variables:', error);
  }
  process.exit(1);
}

export default env;
