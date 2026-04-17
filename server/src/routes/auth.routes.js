import { Router } from "express";
import {
  getMe,
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);

export default router;

