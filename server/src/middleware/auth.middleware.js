import { User } from "../models/User.js";
import { verifyAccessToken } from "../services/token.service.js";
import { createAppError } from "../utils/helpers.js";

/**
 * Verifies the bearer access token and loads the authenticated user.
 * @param {import("express").Request} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>}
 */
export async function requireAuth(req, _res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw createAppError(401, "Authorization token is required.");
    }

    const token = authorizationHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const userId = typeof decoded === "string" ? null : decoded.userId;

    if (!userId) {
      throw createAppError(401, "Invalid access token.");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw createAppError(401, "Authentication failed.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : createAppError(401, "Invalid or expired access token."));
  }
}

