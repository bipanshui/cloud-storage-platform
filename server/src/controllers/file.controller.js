import mime from "mime-types";
import mongoose from "mongoose";
import { File } from "../models/File.js";
import { Folder } from "../models/Folder.js";
import { User } from "../models/User.js";
import {
  copyObjectInS3,
  deleteFromS3,
  getSignedDownloadUrl,
  uploadToS3,
} from "../services/s3.service.js";
import {
  asyncHandler,
  createAppError,
  executeWithTransaction,
  getFileCategoryFilter,
  parseFileName,
  sanitizeFileName,
} from "../utils/helpers.js";

/**
 * Builds an ownership-or-sharing filter for file lookups.
 * @param {string} fileId
 * @param {string} userId
 * @returns {Record<string, unknown>}
 */
function buildAccessibleFileQuery(fileId, userId) {
  return {
    _id: fileId,
    $or: [{ userId }, { "sharedWith.userId": userId }],
  };
}

/**
 * Verifies that a folder belongs to the authenticated user.
 * @param {string | null} folderId
 * @param {string} userId
 * @param {mongoose.ClientSession | null} [session=null]
 * @returns {Promise<object | null>}
 */
async function ensureFolderOwnership(folderId, userId, session = null) {
  if (!folderId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    throw createAppError(400, "Invalid folder identifier.");
  }

  let query = Folder.findOne({ _id: folderId, userId });
  if (session) {
    query = query.session(session);
  }

  const folder = await query;

  if (!folder) {
    throw createAppError(404, "Target folder not found.");
  }

  return folder;
}

/**
 * Loads a file owned by the authenticated user.
 * @param {string} fileId
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function ensureOwnedFile(fileId, userId) {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw createAppError(400, "Invalid file identifier.");
  }

  const file = await File.findOne({ _id: fileId, userId, isDeleted: false });

  if (!file) {
    throw createAppError(404, "File not found.");
  }

  return file;
}

/**
 * Loads a file the authenticated user can access.
 * @param {string} fileId
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function ensureAccessibleFile(fileId, userId) {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw createAppError(400, "Invalid file identifier.");
  }

  const file = await File.findOne({
    ...buildAccessibleFileQuery(fileId, userId),
    isDeleted: false,
  });

  if (!file) {
    throw createAppError(404, "File not found.");
  }

  return file;
}

/**
 * Ensures a user still has enough storage available using atomic update.
 * @param {string} userId
 * @param {number} nextSize
 * @param {mongoose.ClientSession | null} [session=null]
 * @returns {Promise<void>}
 */
async function assertStorageCapacity(userId, nextSize, session = null) {
  const filter = {
    _id: userId,
    $expr: { $lte: [{ $add: ["$storageUsed", nextSize] }, "$storageLimit"] },
  };

  let query = User.findOneAndUpdate(filter, { $inc: { storageUsed: nextSize } });
  if (session) {
    query = query.session(session);
  }

  const user = await query;

  if (!user) {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw createAppError(404, "User not found.");
    }
    throw createAppError(400, "Storage limit exceeded");
  }
}

/**
 * Builds a MongoDB file payload from an uploaded file and S3 result.
 * @param {Express.Multer.File} file
 * @param {string} ownerId
 * @param {{ key: string, url: string }} uploadResult
 * @param {string | null} [parentFolderId=null]
 * @returns {Record<string, unknown>}
 */
function buildFileDocument(file, ownerId, uploadResult, parentFolderId = null) {
  const parsedName = parseFileName(file.originalname);

  return {
    name: parsedName.name,
    originalName: sanitizeFileName(file.originalname),
    type: file.mimetype,
    extension: parsedName.extension || mime.extension(file.mimetype) || null,
    size: file.size,
    userId: ownerId,
    parentFolderId,
    s3Key: uploadResult.key,
    s3Url: uploadResult.url,
    metadata: {},
  };
}

/**
 * Converts a folder query parameter into a MongoDB filter.
 * @param {string | null | undefined} parentFolderId
 * @returns {Record<string, unknown>}
 */
function resolveParentFolderFilter(parentFolderId) {
  if (parentFolderId === undefined) {
    return {};
  }

  if (parentFolderId === "null" || parentFolderId === null || parentFolderId === "") {
    return { parentFolderId: null };
  }

  if (!mongoose.Types.ObjectId.isValid(parentFolderId)) {
    throw createAppError(400, "Invalid folder identifier.");
  }

  return { parentFolderId };
}

/**
 * Uploads a single file for the authenticated user.
 */
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createAppError(400, "A file is required.");
  }

  const parentFolderId = req.body.parentFolderId || null;

  await assertStorageCapacity(req.user.id, req.file.size);
  await ensureFolderOwnership(parentFolderId, req.user.id);

  const uploadResult = await uploadToS3(req.file, req.user.id);

  try {
    const createdFile = await executeWithTransaction(async (session) => {
      const [fileDocument] = await File.create(
        [buildFileDocument(req.file, req.user.id, uploadResult, parentFolderId)],
        { session }
      );

      return fileDocument;
    });

    res.status(201).json({
      success: true,
      data: {
        file: createdFile,
      },
    });
  } catch (error) {
    await deleteFromS3(uploadResult.key).catch(() => undefined);
    throw error;
  }
});

/**
 * Uploads multiple files for the authenticated user.
 */
export const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    throw createAppError(400, "At least one file is required.");
  }

  const parentFolderId = req.body.parentFolderId || null;
  const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);

  await assertStorageCapacity(req.user.id, totalSize);
  await ensureFolderOwnership(parentFolderId, req.user.id);

  const uploadedFiles = [];

  try {
    for (const file of req.files) {
      uploadedFiles.push({
        file,
        uploadResult: await uploadToS3(file, req.user.id),
      });
    }

    const createdFiles = await executeWithTransaction(async (session) => {
      const documents = uploadedFiles.map(({ file, uploadResult }) =>
        buildFileDocument(file, req.user.id, uploadResult, parentFolderId)
      );

      const insertedFiles = await File.insertMany(documents, { session });

      return insertedFiles;
    });

    res.status(201).json({
      success: true,
      data: {
        files: createdFiles,
      },
    });
  } catch (error) {
    await Promise.all(
      uploadedFiles.map(({ uploadResult }) => deleteFromS3(uploadResult.key).catch(() => undefined))
    );
    throw error;
  }
});

/**
 * Returns a paginated file listing.
 */
export const getFiles = asyncHandler(async (req, res) => {
  const {
    parentFolderId,
    search,
    type,
    sortBy = "date",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = req.query;

  const numericPage = Math.max(Number(page) || 1, 1);
  const numericLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const sortMap = {
    name: "name",
    size: "size",
    date: "updatedAt",
  };

  const query = {
    userId: req.user.id,
    isDeleted: false,
    ...resolveParentFolderFilter(parentFolderId),
  };

  if (search) {
    query.$text = { $search: search };
  }

  if (type) {
    Object.assign(query, getFileCategoryFilter(type));
  }

  const sortField = sortMap[sortBy] || "updatedAt";
  const direction = sortOrder === "asc" ? 1 : -1;

  const [files, total] = await Promise.all([
    File.find(query)
      .sort({ [sortField]: direction })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    File.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      files,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit) || 1,
      },
    },
  });
});

/**
 * Returns one file along with a signed download URL.
 */
export const getFileById = asyncHandler(async (req, res) => {
  const file = await ensureAccessibleFile(req.params.id, req.user.id);
  const downloadUrl = await getSignedDownloadUrl(file.s3Key);

  res.status(200).json({
    success: true,
    data: {
      file,
      downloadUrl,
    },
  });
});

/**
 * Returns a temporary download URL for a file.
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const file = await ensureAccessibleFile(req.params.id, req.user.id);
  const downloadUrl = await getSignedDownloadUrl(file.s3Key);

  res.status(200).json({
    success: true,
    data: {
      downloadUrl,
    },
  });
});

/**
 * Renames a file owned by the authenticated user.
 */
export const renameFile = asyncHandler(async (req, res) => {
  const file = await ensureOwnedFile(req.params.id, req.user.id);
  const nextName = sanitizeFileName(req.body.name);

  if (!nextName) {
    throw createAppError(400, "File name cannot be empty.");
  }

  file.name = nextName;
  file.updatedAt = new Date();
  await file.save();

  res.status(200).json({
    success: true,
    data: {
      file,
    },
  });
});

/**
 * Moves a file into another folder or back to root.
 */
export const moveFile = asyncHandler(async (req, res) => {
  const file = await ensureOwnedFile(req.params.id, req.user.id);
  const newParentFolderId = req.body.newParentFolderId || null;

  await ensureFolderOwnership(newParentFolderId, req.user.id);

  const duplicate = await File.findOne({
    userId: req.user.id,
    parentFolderId: newParentFolderId,
    name: file.name,
    isDeleted: false,
    _id: { $ne: file.id },
  });

  if (duplicate) {
    throw createAppError(409, "A file with the same name already exists in the target folder.");
  }

  file.parentFolderId = newParentFolderId;
  file.updatedAt = new Date();
  await file.save();

  res.status(200).json({
    success: true,
    data: {
      file,
    },
  });
});

/**
 * Copies a file for the authenticated user.
 */
export const copyFile = asyncHandler(async (req, res) => {
  const file = await ensureOwnedFile(req.params.id, req.user.id);

  await assertStorageCapacity(req.user.id, file.size);

  const parsed = parseFileName(file.name);
  const baseName = parsed.extension
    ? parsed.name.slice(0, -(parsed.extension.length + 1))
    : parsed.name;
  const copyName = parsed.extension
    ? `${baseName}(Copy).${parsed.extension}`
    : `${baseName}(Copy)`;
  const safeCopyName = sanitizeFileName(copyName);
  const destinationKey = `users/${req.user.id}/${new mongoose.Types.ObjectId().toString()}-${safeCopyName}`;
  const copiedUrl = await copyObjectInS3(file.s3Key, destinationKey, file.type);

  try {
    const copiedFile = await executeWithTransaction(async (session) => {
      const [createdFile] = await File.create(
        [
          {
            name: safeCopyName,
            originalName: file.originalName,
            type: file.type,
            extension: file.extension,
            size: file.size,
            userId: req.user.id,
            parentFolderId: file.parentFolderId,
            s3Key: destinationKey,
            s3Url: copiedUrl,
            metadata: file.metadata || {},
          },
        ],
        { session }
      );

      return createdFile;
    });

    res.status(201).json({
      success: true,
      data: {
        file: copiedFile,
      },
    });
  } catch (error) {
    await deleteFromS3(destinationKey).catch(() => undefined);
    throw error;
  }
});

/**
 * Toggles the starred state for a file.
 */
export const toggleStar = asyncHandler(async (req, res) => {
  const file = await ensureOwnedFile(req.params.id, req.user.id);
  file.isStarred = !file.isStarred;
  await file.save();

  res.status(200).json({
    success: true,
    data: {
      file,
    },
  });
});

/**
 * Moves a file to trash.
 */
export const softDeleteFile = asyncHandler(async (req, res) => {
  const file = await ensureOwnedFile(req.params.id, req.user.id);
  file.isDeleted = true;
  file.deletedAt = new Date();
  await file.save();

  console.log(`Moved file to trash: ${file.id}`);

  res.status(200).json({
    success: true,
    message: "File moved to trash",
  });
});

/**
 * Restores a trashed file.
 */
export const restoreFile = asyncHandler(async (req, res) => {
  const file = await ensureOwnedFile(req.params.id, req.user.id);

  if (file.parentFolderId) {
    const folderExists = await Folder.exists({
      _id: file.parentFolderId,
      userId: req.user.id,
    });

    if (!folderExists) {
      file.parentFolderId = null;
    }
  }

  file.isDeleted = false;
  file.deletedAt = null;
  await file.save();

  res.status(200).json({
    success: true,
    data: {
      file,
    },
  });
});

/**
 * Permanently deletes a file and decrements storage usage.
 */
export const permanentlyDeleteFile = asyncHandler(async (req, res) => {
  const file = await ensureOwnedFile(req.params.id, req.user.id);

  await deleteFromS3(file.s3Key);

  await executeWithTransaction(async (session) => {
    let deleteQuery = File.deleteOne({ _id: file.id });
    if (session) {
      deleteQuery = deleteQuery.session(session);
    }

    await deleteQuery;
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { storageUsed: -file.size } },
      { session }
    );
  });

  res.status(200).json({
    success: true,
    message: "File permanently deleted",
  });
});

/**
 * Returns all trashed files for the authenticated user.
 */
export const getTrashFiles = asyncHandler(async (req, res) => {
  const files = await File.find({
    userId: req.user.id,
    isDeleted: true,
  }).sort({ deletedAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      files,
    },
  });
});

/**
 * Empties a user's trash.
 */
export const emptyTrash = asyncHandler(async (req, res) => {
  const files = await File.find({
    userId: req.user.id,
    isDeleted: true,
  });

  if (!files.length) {
    res.status(200).json({
      success: true,
      data: {
        deletedCount: 0,
      },
      message: "Trash emptied",
    });
    return;
  }

  await Promise.all(files.map((file) => deleteFromS3(file.s3Key).catch(() => undefined)));

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  await executeWithTransaction(async (session) => {
    let deleteQuery = File.deleteMany({
      userId: req.user.id,
      isDeleted: true,
    });

    if (session) {
      deleteQuery = deleteQuery.session(session);
    }

    await deleteQuery;

    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { storageUsed: -totalSize } },
      { session }
    );
  });

  res.status(200).json({
    success: true,
    data: {
      deletedCount: files.length,
    },
    message: "Trash emptied",
  });
});

/**
 * Returns starred files for the authenticated user.
 */
export const getStarredFiles = asyncHandler(async (req, res) => {
  const files = await File.find({
    userId: req.user.id,
    isStarred: true,
    isDeleted: false,
  }).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      files,
    },
  });
});

/**
 * Returns recently updated files for the authenticated user.
 */
export const getRecentFiles = asyncHandler(async (req, res) => {
  const files = await File.find({
    userId: req.user.id,
    isDeleted: false,
  })
    .sort({ updatedAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    data: {
      files,
    },
  });
});

/**
 * Creates a new folder for the authenticated user.
 */
export const createFolder = asyncHandler(async (req, res) => {
  const { name, parentFolderId } = req.body;

  if (!name || !name.trim()) {
    throw createAppError(400, "Folder name is required.");
  }

  const safeName = sanitizeFileName(name.trim());

  if (parentFolderId) {
    await ensureFolderOwnership(parentFolderId, req.user.id);
  }

  const existingFolder = await Folder.findOne({
    userId: req.user.id,
    parentFolderId: parentFolderId || null,
    name: safeName,
  });

  if (existingFolder) {
    throw createAppError(409, "A folder with this name already exists in the target location.");
  }

  const folder = await Folder.create({
    name: safeName,
    userId: req.user.id,
    parentFolderId: parentFolderId || null,
  });

  res.status(201).json({
    success: true,
    data: {
      folder,
    },
  });
});

/**
 * Returns folders for the authenticated user.
 */
export const getFolders = asyncHandler(async (req, res) => {
  const { parentFolderId } = req.query;

  const filter = {
    userId: req.user.id,
  };

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
    data: {
      folders,
    },
  });
});
