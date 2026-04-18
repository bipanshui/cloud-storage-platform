import { Router } from "express";
import {
  createFolder,
  emptyFolderTrash,
  getDeletedFolders,
  getFolderById,
  getFolderContents,
  getFolderSize,
  getFolderTree,
  getFolders,
  getStarredFolders,
  moveFolder,
  permanentlyDeleteFolder,
  renameFolder,
  restoreFolder,
  searchFolders,
  softDeleteFolder,
  toggleStarFolder,
} from "../controllers/folder.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createFolderSchema,
  moveFolderSchema,
  renameFolderSchema,
} from "../utils/validators.js";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createFolderSchema), createFolder);
router.get("/tree", getFolderTree);
router.get("/search", searchFolders);
router.get("/starred", getStarredFolders);
router.get("/trash", getDeletedFolders);
router.delete("/trash/empty", emptyFolderTrash);
router.get("/", getFolders);
router.get("/:id", getFolderById);
router.get("/:id/contents", getFolderContents);
router.get("/:id/size", getFolderSize);
router.patch("/:id/rename", validate(renameFolderSchema), renameFolder);
router.patch("/:id/move", validate(moveFolderSchema), moveFolder);
router.patch("/:id/star", toggleStarFolder);
router.patch("/:id/restore", restoreFolder);
router.delete("/:id", softDeleteFolder);
router.delete("/:id/permanent", permanentlyDeleteFolder);

export default router;