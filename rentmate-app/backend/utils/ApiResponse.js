// Standardized API Response Structure
// Purpose: Ensures every client response follows a uniform pattern for data, status, and messages.
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // Semantic checks: success is true for all status codes below 400
  }
}

export default ApiResponse;
