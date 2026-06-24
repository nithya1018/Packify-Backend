// Handle 404 not found
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Route not found - ${req.originalUrl}`,
  });
};

// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};