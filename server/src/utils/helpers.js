import { env } from "../config/env.js";
import { REFRESH_TOKEN_COOKIE_NAME } from "./constants.js";

/**
 * Wraps an async route handler and forwards errors to Express.
 * @param {import("express").RequestHandler} handler
 * @returns {import("express").RequestHandler}
 */
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

/**
 * Creates a standard application error.
 * @param {number} statusCode
 * @param {string} message
 * @returns {Error & { statusCode: number }}
 */
export function createAppError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Computes cookie options used for refresh tokens.
 * @returns {import("express").CookieOptions}
 */
export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    path: "/api/auth",
  };
}

/**
 * Sets the refresh token cookie on the response.
 * @param {import("express").Response} res
 * @param {string} token
 * @returns {void}
 */
export function setRefreshTokenCookie(res, token) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, getRefreshCookieOptions());
}

/**
 * Clears the refresh token cookie from the response.
 * @param {import("express").Response} res
 * @returns {void}
 */
export function clearRefreshTokenCookie(res) {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshCookieOptions());
}

