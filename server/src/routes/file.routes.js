import { Router } from "express";
import {
  copyFile,
  downloadFile,
  emptyTrash,
  getFileById,
  getFiles,
  getRecentFiles,
  getStarredFiles,
  getTrashFiles,
  moveFile,
  permanentlyDeleteFile,
  renameFile,
  restoreFile,
  softDeleteFile,
  toggleStar,
  uploadFile,
  uploadMultipleFiles,
} from "../controllers/file.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadRateLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  uploadMultipleFilesMiddleware,
  uploadSingleFile,
} from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { moveFileSchema, renameFileSchema } from "../utils/validators.js";

const router = Router();

router.use(requireAuth);

router.post("/upload", uploadRateLimiter, uploadSingleFile, uploadFile);
router.post(
  "/upload-multiple",
  uploadRateLimiter,
  uploadMultipleFilesMiddleware,
  uploadMultipleFiles
);
router.get("/", getFiles);
router.get("/recent", getRecentFiles);
router.get("/starred", getStarredFiles);
router.get("/trash", getTrashFiles);
router.delete("/trash/empty", emptyTrash);
router.get("/:id/download", downloadFile);
router.get("/:id", getFileById);
router.patch("/:id/rename", validate(renameFileSchema), renameFile);
router.patch("/:id/move", validate(moveFileSchema), moveFile);
router.post("/:id/copy", copyFile);
router.patch("/:id/star", toggleStar);
router.patch("/:id/restore", restoreFile);
router.delete("/:id/permanent", permanentlyDeleteFile);
router.delete("/:id", softDeleteFile);

export default router;
