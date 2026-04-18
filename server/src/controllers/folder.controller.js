import mongoose from "mongoose";
import { Folder } from "../models/Folder.js";
import { File } from "../models/File.js";
import {
  getDescendantFolderIds,
  getDescendantFileIds,
  calculateFolderSize,
  isDescendant,
  buildBreadcrumb,
  recalculateFolderPath,
  updateFolderMetadata,
  sanitizeFolderName,
} from "../utils/folderHelpers.js";
import {
  asyncHandler,
  createAppError,
  executeWithTransaction,
} from "../utils/helpers.js";

const MAX_DEPTH = 10;

async function ensureOwnedFolder(folderId, userId, mustExist = true) {
  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    throw createAppError(400, "Invalid folder identifier.");
  }

  const folder = await Folder.findOne({
    _id: folderId,
    userId,
  });

  if (!folder) {
    if (mustExist) {
      throw createAppError(404, "Folder not found.");
    }
    return null;
  }

  return folder;
}

async function checkDuplicateFolderName(userId, name, parentFolderId, excludeId = null) {
  const existing = await Folder.findOne({
    userId,
    parentFolderId: parentFolderId || null,
    name: { $regex: new RegExp(`^${name}$`, "i") },
    ...(excludeId && { _id: { $ne: excludeId } }),
  });

  return existing;
}

export const createFolder = asyncHandler(async (req, res) => {
  const { name, parentFolderId, color } = req.body;
  const userId = req.user.id;

  const safeName = sanitizeFolderName(name);
  if (!safeName) {
    throw createAppError(400, "Folder name is required and cannot contain special characters.");
  }

  let parentFolder = null;
  let newDepth = 0;
  let newPath = `/${safeName}`;

  if (parentFolderId) {
    parentFolder = await ensureOwnedFolder(parentFolderId, userId);
    if (!parentFolder) {
      throw createAppError(404, "Parent folder not found.");
    }

    if (parentFolder.depth >= MAX_DEPTH) {
      throw createAppError(400, `Maximum folder depth of ${MAX_DEPTH} exceeded.`);
    }

    newDepth = parentFolder.depth + 1;
    newPath = `${parentFolder.path}/${safeName}`;
  }

  const duplicate = await checkDuplicateFolderName(userId, safeName, parentFolderId);
  if (duplicate) {
    throw createAppError(409, "A folder with this name already exists in the target location.");
  }

  const folder = await Folder.create({
    name: safeName,
    userId,
    parentFolderId: parentFolderId || null,
    path: newPath,
    depth: newDepth,
    color: color || null,
  });

  if (parentFolder) {
    parentFolder.metadata.itemCount += 1;
    await parentFolder.save();
  }

  res.status(201).json({
    success: true,
    data: { folder },
  });
});

export const getFolders = asyncHandler(async (req, res) => {
  const { parentFolderId, includeDeleted } = req.query;
  const userId = req.user.id;

  const filter = { userId };

  if (!includeDeleted || includeDeleted === "false") {
    filter.isDeleted = false;
  }

  if (parentFolderId === "null" || parentFolderId === "" || parentFolderId === undefined) {
    filter.parentFolderId = null;
  } else if (parentFolderId) {
    if (!mongoose.Types.ObjectId.isValid(parentFolderId)) {
      throw createAppError(400, "Invalid folder identifier.");
    }
    filter.parentFolderId = parentFolderId;
  }

  const folders = await Folder.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: { folders },
  });
});

export const getFolderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const folder = await ensureOwnedFolder(id, userId);
  if (!folder) {
    throw createAppError(404, "Folder not found.");
  }

  const [childFoldersCount, filesCount] = await Promise.all([
    Folder.countDocuments({ parentFolderId: folder._id, isDeleted: false }),
    File.countDocuments({ parentFolderId: folder._id, isDeleted: false }),
  ]);

  const ancestors = await buildBreadcrumb(folder._id, userId);

  res.status(200).json({
    success: true,
    data: {
      folder,
      childFoldersCount,
      filesCount,
      ancestors,
    },
  });
});

export const getFolderContents = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sortBy = "name", sortOrder = "asc" } = req.query;
  const userId = req.user.id;

  const folderId = id === "root" ? null : id;

  const folder = folderId
    ? await ensureOwnedFolder(folderId, userId)
    : null;

  if (folderId && !folder) {
    throw createAppError(404, "Folder not found.");
  }

  const sortField = sortBy === "date" ? "updatedAt" : sortBy === "size" ? "size" : "name";
  const direction = sortOrder === "desc" ? -1 : 1;

  const [folders, files] = await Promise.all([
    Folder.find({
      userId,
      parentFolderId: folderId,
      isDeleted: false,
    }).sort({ [sortField]: direction }),
    File.find({
      userId,
      parentFolderId: folderId,
      isDeleted: false,
    }).sort({ [sortField]: direction }),
  ]);

  const breadcrumb = folderId
    ? await buildBreadcrumb(folderId, userId)
    : [];

  res.status(200).json({
    success: true,
    data: {
      folders,
      files,
      breadcrumb,
    },
  });
});

export const getFolderTree = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const allFolders = await Folder.find({
    userId,
    isDeleted: false,
  }).sort({ name: 1 });

  const buildTree = (parentId) => {
    return allFolders
      .filter((f) =>
        parentId
          ? f.parentFolderId?.toString() === parentId.toString()
          : f.parentFolderId === null
      )
      .map((folder) => ({
        _id: folder._id,
        name: folder.name,
        path: folder.path,
        depth: folder.depth,
        color: folder.color,
        children: buildTree(folder._id),
      }));
  };

  const tree = buildTree(null);

  res.status(200).json({
    success: true,
    data: { tree },
  });
});

export const renameFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  const folder = await ensureOwnedFolder(id, userId);
  if (!folder) {
    throw createAppError(404, "Folder not found.");
  }

  const safeName = sanitizeFolderName(name);
  if (!safeName) {
    throw createAppError(400, "Folder name is required and cannot contain special characters.");
  }

  const duplicate = await checkDuplicateFolderName(
    userId,
    safeName,
    folder.parentFolderId,
    folder._id
  );
  if (duplicate) {
    throw createAppError(409, "A folder with this name already exists in this location.");
  }

  const oldPath = folder.path;
  const newPath = folder.parentFolderId
    ? `${folder.path.replace(`/${folder.name}/`, `/${safeName}/`)}`
    : `/${safeName}`;

  folder.name = safeName;
  folder.path = newPath;
  await folder.save();

  await recalculateFolderPath(folder, newPath, folder.depth);

  res.status(200).json({
    success: true,
    data: { folder },
  });
});

export const moveFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newParentFolderId } = req.body;
  const userId = req.user.id;

  const folder = await ensureOwnedFolder(id, userId);
  if (!folder) {
    throw createAppError(404, "Folder not found.");
  }

  if (newParentFolderId?.toString() === folder._id.toString()) {
    throw createAppError(400, "Cannot move a folder into itself.");
  }

  if (newParentFolderId) {
    const isDesc = await isDescendant(newParentFolderId, folder._id, userId);
    if (isDesc) {
      throw createAppError(400, "Cannot move a folder into one of its own descendants.");
    }
  }

  const targetParentFolder = newParentFolderId
    ? await ensureOwnedFolder(newParentFolderId, userId)
    : null;

  if (newParentFolderId && targetParentFolder && targetParentFolder.depth >= MAX_DEPTH - 1) {
    throw createAppError(400, `Maximum folder depth of ${MAX_DEPTH} exceeded.`);
  }

  const sameLocation =
    (!folder.parentFolderId && !newParentFolderId) ||
    folder.parentFolderId?.toString() === newParentFolderId?.toString();

  if (sameLocation) {
    throw createAppError(400, "Folder is already in this location.");
  }

  const duplicate = await checkDuplicateFolderName(
    userId,
    folder.name,
    newParentFolderId,
    folder._id
  );
  if (duplicate) {
    throw createAppError(409, "A folder with this name already exists in the target location.");
  }

  const oldParent = folder.parentFolderId
    ? await Folder.findById(folder.parentFolderId)
    : null;

  const newDepth = newParentFolderId
    ? (targetParentFolder?.depth ?? -1) + 1
    : 0;
  const newPath = newParentFolderId
    ? `${targetParentFolder.path}/${folder.name}`
    : `/${folder.name}`;

  folder.parentFolderId = newParentFolderId || null;
  folder.path = newPath;
  folder.depth = newDepth;
  await folder.save();

  await recalculateFolderPath(folder, newPath, newDepth);

  if (oldParent) {
    const oldChildren = await Folder.countDocuments({
      parentFolderId: oldParent._id,
      isDeleted: false,
    });
    oldParent.metadata.itemCount = oldChildren;
    await oldParent.save();
  }

  if (targetParentFolder) {
    targetParentFolder.metadata.itemCount += 1;
    await targetParentFolder.save();
  }

  res.status(200).json({
    success: true,
    data: { folder },
  });
});

export const toggleStarFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const folder = await ensureOwnedFolder(id, userId);
  if (!folder) {
    throw createAppError(404, "Folder not found.");
  }

  folder.isStarred = !folder.isStarred;
  await folder.save();

  res.status(200).json({
    success: true,
    data: { folder },
  });
});

export const softDeleteFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const folder = await ensureOwnedFolder(id, userId);
  if (!folder) {
    throw createAppError(404, "Folder not found.");
  }

  const descendantFolderIds = await getDescendantFolderIds(folder._id);
  const allFolderIds = [folder._id.toString(), ...descendantFolderIds];

  const descendantFileIds = await getDescendantFileIds(folder._id);
  const allFileIds = [...descendantFileIds];

  const [deletedFolderResult, deletedFileResult] = await Promise.all([
    Folder.updateMany(
      { _id: { $in: allFolderIds } },
      { isDeleted: true, deletedAt: new Date() }
    ),
    File.updateMany(
      { _id: { $in: allFileIds } },
      { isDeleted: true, deletedAt: new Date() }
    ),
  ]);

  if (folder.parentFolderId) {
    const parent = await Folder.findById(folder.parentFolderId);
    if (parent) {
      parent.metadata.itemCount = Math.max(
        0,
        parent.metadata.itemCount - deletedFolderResult.modifiedCount
      );
      await parent.save();
    }
  }

  res.status(200).json({
    success: true,
    data: {
      deletedItems: {
        folders: deletedFolderResult.modifiedCount,
        files: deletedFileResult.modifiedCount,
      },
    },
    message: "Folder moved to trash",
  });
});

export const restoreFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const folder = await Folder.findOne({
    _id: id,
    userId,
    isDeleted: true,
  });

  if (!folder) {
    throw createAppError(404, "Folder not found in trash.");
  }

  if (folder.parentFolderId) {
    const parentExists = await Folder.findOne({
      _id: folder.parentFolderId,
      userId,
      isDeleted: false,
    });

    if (!parentExists) {
      folder.parentFolderId = null;
      folder.path = `/${folder.name}`;
      folder.depth = 0;
    }
  }

  folder.isDeleted = false;
  folder.deletedAt = null;
  await folder.save();

  const descendantFolderIds = await getDescendantFolderIds(folder._id);
  const allFolderIds = [folder._id.toString(), ...descendantFolderIds];

  await Folder.updateMany(
    { _id: { $in: allFolderIds } },
    { isDeleted: false, deletedAt: null }
  );

  const descendantFileIds = await getDescendantFileIds(folder._id);
  const allFileIds = [...descendantFileIds];

  await File.updateMany(
    { _id: { $in: allFileIds } },
    { isDeleted: false, deletedAt: null }
  );

  if (folder.parentFolderId) {
    await updateFolderMetadata(folder.parentFolderId);
  }

  res.status(200).json({
    success: true,
    data: { folder },
  });
});

export const permanentlyDeleteFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const folder = await ensureOwnedFolder(id, userId);
  if (!folder) {
    throw createAppError(404, "Folder not found.");
  }

  const descendantFolderIds = await getDescendantFolderIds(folder._id);
  const allFolderIds = [folder._id.toString(), ...descendantFolderIds];

  const descendantFileIds = await getDescendantFileIds(folder._id);
  const allFileIds = [...descendantFileIds];

  let freedSpace = 0;
  if (allFileIds.length > 0) {
    const files = await File.find({ _id: { $in: allFileIds } });
    for (const file of files) {
      freedSpace += file.size;
    }
  }

  const deletedFileCount = allFileIds.length;
  const deletedFolderCount = allFolderIds.length;

  const [, ,] = await Promise.all([
    File.deleteMany({ _id: { $in: allFileIds } }),
    Folder.deleteMany({ _id: { $in: allFolderIds } }),
  ]);

  if (folder.parentFolderId) {
    const parent = await Folder.findById(folder.parentFolderId);
    if (parent) {
      parent.metadata.itemCount = Math.max(0, parent.metadata.itemCount - deletedFolderCount);
      await parent.save();
    }
  }

  res.status(200).json({
    success: true,
    data: {
      deletedItems: {
        folders: deletedFolderCount,
        files: deletedFileCount,
      },
      freedSpace,
    },
    message: "Folder permanently deleted",
  });
});

export const getFolderSize = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const folder = await ensureOwnedFolder(id, userId);
  if (!folder) {
    throw createAppError(404, "Folder not found.");
  }

  const sizeInfo = await calculateFolderSize(folder._id, userId);

  res.status(200).json({
    success: true,
    data: {
      totalSize: sizeInfo.totalSize,
      formattedSize: formatBytes(sizeInfo.totalSize),
      fileCount: sizeInfo.fileCount,
      folderCount: sizeInfo.folderCount,
    },
  });
});

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const searchFolders = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const userId = req.user.id;

  if (!q || q.trim().length === 0) {
    throw createAppError(400, "Search query is required.");
  }

  const folders = await Folder.find({
    userId,
    name: { $regex: q, $options: "i" },
    isDeleted: false,
  }).limit(20);

  res.status(200).json({
    success: true,
    data: { folders },
  });
});

export const getStarredFolders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const folders = await Folder.find({
    userId,
    isStarred: true,
    isDeleted: false,
  }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: { folders },
  });
});

export const getDeletedFolders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const folders = await Folder.find({
    userId,
    isDeleted: true,
  }).sort({ deletedAt: -1 });

  res.status(200).json({
    success: true,
    data: { folders },
  });
});

export const emptyFolderTrash = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const deletedFolders = await Folder.find({
    userId,
    isDeleted: true,
  });

  let totalFilesDeleted = 0;
  let totalFoldersDeleted = 0;
  let freedSpace = 0;

  for (const folder of deletedFolders) {
    const fileIds = await getDescendantFileIds(folder._id);
    const folderIds = await getDescendantFolderIds(folder._id);

    const files = await File.find({ _id: { $in: fileIds } });
    for (const file of files) {
      freedSpace += file.size;
    }
    totalFilesDeleted += files.length;
    totalFoldersDeleted += folderIds.length + 1;
  }

  const allFolderIds = deletedFolders.map((f) => f._id.toString());
  const allFileIds = await getDescendantFileIds(deletedFolders[0]?._id);

  await Promise.all([
    File.deleteMany({ _id: { $in: allFileIds } }),
    Folder.deleteMany({ _id: { $in: allFolderIds } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      deletedItems: {
        folders: totalFoldersDeleted,
        files: totalFilesDeleted,
      },
      freedSpace,
    },
    message: "Folder trash emptied",
  });
});