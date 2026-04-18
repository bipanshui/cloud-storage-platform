import mongoose from "mongoose";
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

/**
 * Formats bytes into a readable unit string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes = 0) {
  if (!bytes) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  const precision = value >= 10 ? 0 : 1;

  return `${value.toFixed(precision)} ${units[exponent]}`;
}

/**
 * Removes unsafe characters from a file name while preserving readability.
 * @param {string} fileName
 * @returns {string}
 */
export function sanitizeFileName(fileName = "") {
  return fileName
    .replace(/[^\w.\-()\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);
}

/**
 * Returns the display name and extension for a file.
 * @param {string} fileName
 * @returns {{ name: string, extension: string | null }}
 */
export function parseFileName(fileName = "") {
  const sanitized = sanitizeFileName(fileName);
  const lastDotIndex = sanitized.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === sanitized.length - 1) {
    return {
      name: sanitized || "Untitled",
      extension: null,
    };
  }

  return {
    name: sanitized,
    extension: sanitized.slice(lastDotIndex + 1).toLowerCase(),
  };
}

/**
 * Returns a coarse file category from a MIME type.
 * @param {string} mimeType
 * @returns {"image" | "document" | "video" | "audio" | "archive" | "other"}
 */
export function getFileCategoryFromMime(mimeType = "") {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("excel") ||
    mimeType.includes("sheet") ||
    mimeType.startsWith("text/")
  ) {
    return "document";
  }

  if (mimeType.includes("zip") || mimeType.includes("archive")) {
    return "archive";
  }

  return "other";
}

/**
 * Builds a Mongo filter for file category queries.
 * @param {string} category
 * @returns {Record<string, unknown>}
 */
export function getFileCategoryFilter(category) {
  switch (category) {
    case "image":
      return { type: /^image\// };
    case "video":
      return { type: /^video\// };
    case "audio":
      return { type: /^audio\// };
    case "document":
      return {
        $or: [
          { type: /^text\// },
          { type: /pdf/i },
          { type: /word/i },
          { type: /excel/i },
          { type: /sheet/i },
        ],
      };
    case "archive":
      return {
        $or: [{ type: /zip/i }, { type: /archive/i }],
      };
    default:
      return {};
  }
}

/**
 * Runs a database mutation within a mongoose transaction when available.
 * Falls back to non-transactional execution for local standalone MongoDB.
 * @template T
 * @param {(session: mongoose.ClientSession | null) => Promise<T>} handler
 * @returns {Promise<T>}
 */
export async function executeWithTransaction(handler) {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await handler(session);
    });

    return result;
  } catch (error) {
    const unsupportedTransaction =
      error?.code === 20 ||
      /Transaction numbers are only allowed|replica set|standalone/i.test(error?.message || "");

    if (!unsupportedTransaction) {
      throw error;
    }

    console.warn("Transactions unavailable in current MongoDB deployment. Falling back.");
    return handler(null);
  } finally {
    await session.endSession();
  }
}
