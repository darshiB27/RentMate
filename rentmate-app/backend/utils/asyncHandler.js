// Promise Catch wrapper for Async Controller functions
// Purpose: Captures rejected promises in Express middleware routes and bubbles them to the global error middleware automatically.
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
