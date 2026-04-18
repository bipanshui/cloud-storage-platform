import { Router } from "express";
import { getStorageInfo } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/storage", getStorageInfo);

export default router;
