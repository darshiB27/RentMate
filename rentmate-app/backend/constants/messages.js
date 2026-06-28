// Application String Messages Dictionary
// Purpose: Centralises API response strings to support internationalisation or bulk message updates easily.
export const MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully. Please verify your email.',
    LOGIN_SUCCESS: 'Logged in successfully.',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    UNAUTHORIZED: 'You are not authenticated. Please log in.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    TOKEN_EXPIRED: 'Session expired. Please log in again.',
    TOKEN_INVALID: 'Invalid session token. Access denied.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    EMAIL_VERIFIED: 'Email verified successfully.',
    EMAIL_ALREADY_VERIFIED: 'Email is already verified.',
  },
  PROPERTY: {
    CREATE_SUCCESS: 'Property listing created successfully.',
    UPDATE_SUCCESS: 'Property listing updated successfully.',
    DELETE_SUCCESS: 'Property listing deleted successfully.',
    NOT_FOUND: 'Property listing not found.',
    UNAUTHORIZED_OWNER: 'You do not have administrative ownership of this property.',
  },
  INQUIRY: {
    SUBMIT_SUCCESS: 'Inquiry submitted successfully.',
    NOT_FOUND: 'Inquiry record not found.',
  },
  REVIEW: {
    CREATE_SUCCESS: 'Review added successfully.',
    DELETE_SUCCESS: 'Review deleted successfully.',
    NOT_FOUND: 'Review not found.',
    ALREADY_EXISTS: 'You have already submitted a review for this property.',
  },
  GENERAL: {
    SERVER_ERROR: 'An unexpected database or server error occurred.',
    HEALTHY: 'Server is online and fully functional.',
    NOT_FOUND: 'The requested routing endpoint or file does not exist.',
    VALIDATION_ERROR: 'Validation failed for one or more request fields.',
  }
};

export default MESSAGES;
