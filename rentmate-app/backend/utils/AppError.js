// Application Custom Generic Error
// Purpose: Base helper wrapper for structural application errors.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
export default AppError;
