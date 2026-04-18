import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { FIFTEEN_MINUTES_IN_MS, ONE_MINUTE_IN_MS } from "../utils/constants.js";

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

export const uploadRateLimiter = rateLimit({
  windowMs: ONE_MINUTE_IN_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  handler: (_req, res) => {
    res.status(429).json(standardHandler("Too many uploads, please try again in a minute."));
  },
});
