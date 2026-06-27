import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle MongoDB Duplicate Key errors (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = field ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` : 'Duplicate entry detected.';
    error = new ApiError(400, message);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid session token. Please authenticate again.');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Your session has expired. Please log in again.');
  }

  // Classify standard native errors as standard ApiErrors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'An unexpected server error occurred.';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  // Log complete error context via winston
  logger.error(`${req.method} ${req.originalUrl} - Status: ${error.statusCode} - Msg: ${error.message}`);

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
