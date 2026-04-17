import { env } from "../config/env.js";

/**
 * Formats and sends application errors.
 * @param {Error & { statusCode?: number; code?: number; name?: string }} err
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 * @returns {void}
 */
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "A resource with that value already exists.";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  const response = {
    success: false,
    message,
  };

  if (env.nodeEnv === "development") {
    response.error = err.name;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

