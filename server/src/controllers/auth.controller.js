import { User } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/token.service.js";
import {
  asyncHandler,
  clearRefreshTokenCookie,
  createAppError,
  setRefreshTokenCookie,
} from "../utils/helpers.js";
import { loginSchema, registerSchema } from "../utils/validators.js";
import { REFRESH_TOKEN_COOKIE_NAME } from "../utils/constants.js";

/**
 * Validates a request body against a Joi schema.
 * @param {import("joi").ObjectSchema} schema
 * @param {Record<string, unknown>} payload
 * @returns {Promise<Record<string, unknown>>}
 */
async function validatePayload(schema, payload) {
  return schema.validateAsync(payload, {
    abortEarly: false,
    stripUnknown: true,
  });
}

/**
 * Creates a new access/refresh token pair for a user.
 * @param {string} userId
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function createTokenPair(userId) {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
}

/**
 * Registers a new user account.
 */
export const register = asyncHandler(async (req, res) => {
  const payload = await validatePayload(registerSchema, req.body);
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw createAppError(409, "Email is already registered.");
  }

  const user = await User.create(payload);
  const { accessToken, refreshToken } = createTokenPair(user.id);

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
  });
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * Authenticates a user with email and password.
 */
export const login = asyncHandler(async (req, res) => {
  const payload = await validatePayload(loginSchema, req.body);
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw createAppError(401, "Invalid email or password.");
  }

  const isPasswordValid = await user.comparePassword(payload.password);

  if (!isPasswordValid) {
    throw createAppError(401, "Invalid email or password.");
  }

  const { accessToken, refreshToken } = createTokenPair(user.id);
  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
  });
  user.lastLogin = new Date();
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * Rotates a refresh token and returns a new access token.
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!incomingRefreshToken) {
    throw createAppError(401, "Refresh token is required.");
  }

  const decoded = verifyRefreshToken(incomingRefreshToken);
  const userId = typeof decoded === "string" ? null : decoded.userId;

  if (!userId) {
    throw createAppError(401, "Invalid refresh token.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw createAppError(401, "Authentication failed.");
  }

  const hasToken = user.refreshTokens.some(
    (storedToken) => storedToken.token === incomingRefreshToken
  );

  if (!hasToken) {
    throw createAppError(401, "Refresh token not recognized.");
  }

  user.refreshTokens = user.refreshTokens.filter(
    (storedToken) => storedToken.token !== incomingRefreshToken
  );

  const tokens = createTokenPair(user.id);
  user.refreshTokens.push({
    token: tokens.refreshToken,
    createdAt: new Date(),
  });
  await user.save();

  setRefreshTokenCookie(res, tokens.refreshToken);

  res.status(200).json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * Logs out the authenticated user and removes the current refresh token.
 */
export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (incomingRefreshToken) {
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (storedToken) => storedToken.token !== incomingRefreshToken
    );
    await req.user.save();
  }

  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * Returns the authenticated user's profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});
