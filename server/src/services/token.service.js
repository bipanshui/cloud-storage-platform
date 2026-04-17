import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Generates a signed access token for a user.
 * @param {string} userId
 * @returns {string}
 */
export function generateAccessToken(userId) {
  return jwt.sign({ userId }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiry,
  });
}

/**
 * Generates a signed refresh token for a user.
 * @param {string} userId
 * @returns {string}
 */
export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiry,
  });
}

/**
 * Verifies a signed access token.
 * @param {string} token
 * @returns {jwt.JwtPayload | string}
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

/**
 * Verifies a signed refresh token.
 * @param {string} token
 * @returns {jwt.JwtPayload | string}
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

