import ApiError from '../utils/ApiError.js';

/**
 * Validates request payload against a Zod schema.
 * Replaces req.body with parsed/cleaned values, preventing parameter pollution.
 * @param {z.ZodSchema} schema - Zod schema validation rules.
 * @returns {Function} - Express middleware wrapper.
 */
export const validateSchema = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      // Map validation issues into detailed errors list
      const errorDetails = (result.error.issues || result.error.errors).map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return next(new ApiError(400, 'Request validation failed.', errorDetails));
    }
    
    // Substitute original body with parsed schemas (strips out unexpected parameters)
    req.body = result.data;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates request query parameters against a Zod schema.
 * Replaces req.query with parsed/cleaned values, converting parameter types if necessary.
 * @param {z.ZodSchema} schema - Zod schema validation rules.
 * @returns {Function} - Express middleware wrapper.
 */
export const validateQuery = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.query);
    
    if (!result.success) {
      // Map validation issues into detailed errors list
      const errorDetails = (result.error.issues || result.error.errors).map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return next(new ApiError(400, 'Query validation failed.', errorDetails));
    }
    
    // Substitute original query with parsed schemas (strips out unexpected parameters)
    // Avoid reassigning req.query reference to prevent "getter-only" TypeErrors
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, result.data);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates request URL parameters against a Zod schema.
 * Replaces req.params with parsed/cleaned values.
 * @param {z.ZodSchema} schema - Zod schema validation rules.
 * @returns {Function} - Express middleware wrapper.
 */
export const validateParams = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.params);
    
    if (!result.success) {
      // Map validation issues into detailed errors list
      const errorDetails = (result.error.issues || result.error.errors).map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return next(new ApiError(400, 'Route parameter validation failed.', errorDetails));
    }
    
    // Substitute original params with parsed schemas
    // Avoid reassigning req.params reference to prevent "getter-only" TypeErrors
    Object.keys(req.params).forEach((key) => delete req.params[key]);
    Object.assign(req.params, result.data);
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  validateSchema,
  validateQuery,
  validateParams,
};


