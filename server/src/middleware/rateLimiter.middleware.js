import rateLimit from "express-rate-limit";
import { FIFTEEN_MINUTES_IN_MS } from "../utils/constants.js";

const standardHandler = (message) => ({
  success: false,
  message,
});

export const generalRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_IN_MS,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(standardHandler("Too many requests, please try again later."));
  },
});

export const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_IN_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res
      .status(429)
      .json(standardHandler("Too many authentication attempts, please try again later."));
  },
});

