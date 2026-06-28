import { z } from 'zod';

const objectIdSchema = z
  .string({ required_error: 'Property identifier is required.' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid property identifier format.');

const coerceInt = (defValue) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defValue;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defValue : parsed;
  }, z.number().int().optional());

// Address schema
const addressSchema = z.object({
  street: z.string({ required_error: 'Street address is required.' }).trim().min(1, 'Street cannot be empty.'),
  locality: z.string({ required_error: 'Locality is required.' }).trim().min(1, 'Locality cannot be empty.'),
  city: z.string({ required_error: 'City is required.' }).trim().min(1, 'City cannot be empty.'),
  state: z.string({ required_error: 'State is required.' }).trim().min(1, 'State cannot be empty.'),
  zipCode: z.string({ required_error: 'Zip code is required.' }).trim().min(1, 'Zip code cannot be empty.'),
});

// Create property validator
export const createPropertySchema = z.object({
  title: z
    .string({ required_error: 'Title is required.' })
    .trim()
    .min(10, 'Title must be at least 10 characters.')
    .max(100, 'Title cannot exceed 100 characters.'),
  description: z
    .string({ required_error: 'Description is required.' })
    .trim()
    .min(20, 'Description must be at least 20 characters.')
    .max(2000, 'Description cannot exceed 2000 characters.'),
  price: z.coerce
    .number({ required_error: 'Monthly rent price is required.' })
    .min(0, 'Price cannot be negative.'),
  type: z.enum(['PG', 'Hostel', 'Flat'], {
    errorMap: () => ({ message: 'Type must be PG, Hostel, or Flat.' }),
  }),
  sharingType: z.enum(['single', 'double', 'triple', 'quad', 'other'], {
    errorMap: () => ({ message: 'Invalid sharing configuration type.' }),
  }),
  genderCategory: z.enum(['boys', 'girls', 'unisex'], {
    errorMap: () => ({ message: 'Gender category must be boys, girls, or unisex.' }),
  }),
  amenities: z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val.split(',').map((a) => a.trim());
      }
    }
    return val;
  }, z.array(z.string()).min(1, 'At least one amenity is required.')),
  longitude: z.coerce
    .number({ required_error: 'Longitude is required.' })
    .min(-180, 'Longitude must be between -180 and 180.')
    .max(180, 'Longitude must be between -180 and 180.'),
  latitude: z.coerce
    .number({ required_error: 'Latitude is required.' })
    .min(-90, 'Latitude must be between -90 and 90.')
    .max(90, 'Latitude must be between -90 and 90.'),
  address: z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, addressSchema),
});

// Update property validator (all fields optional)
export const updatePropertySchema = createPropertySchema.partial();

// Availability validator
export const updateAvailabilitySchema = z.object({
  availabilityStatus: z.enum(['available', 'occupied', 'maintenance'], {
    required_error: 'Availability status is required.',
  }),
});

// Proximity search validator
export const nearbyQuerySchema = z.object({
  longitude: z.coerce
    .number({ required_error: 'Longitude is required.' })
    .min(-180)
    .max(180),
  latitude: z.coerce
    .number({ required_error: 'Latitude is required.' })
    .min(-90)
    .max(90),
  maxDistance: z.coerce
    .number()
    .min(100, 'Radius must be at least 100 meters.')
    .default(5000)
    .optional(),
  page: coerceInt(1),
  limit: coerceInt(10),
});

// General paginated search queries
export const propertyQuerySchema = z.object({
  page: coerceInt(1),
  limit: coerceInt(10),
});

export const propertyParamsSchema = z.object({
  id: objectIdSchema,
});

export default {
  createPropertySchema,
  updatePropertySchema,
  updateAvailabilitySchema,
  nearbyQuerySchema,
  propertyQuerySchema,
  propertyParamsSchema,
};
