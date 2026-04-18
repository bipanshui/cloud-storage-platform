import mongoose from "mongoose";
import { Folder } from "../models/Folder.js";
import { File } from "../models/File.js";

export async function getDescendantFolderIds(folderId) {
  const descendantIds = new Set();

  async function collectIds(id) {
    descendantIds.add(id.toString());
    const children = await Folder.find({ parentFolderId: id }).select("_id");
    for (const child of children) {
      await collectIds(child._id);
    }
  }

  await collectIds(folderId);
  return Array.from(descendantIds);
}

export async function getDescendantFileIds(folderId) {
  const fileIds = new Set();
  const folderIds = await getDescendantFolderIds(folderId);
  folderIds.push(folderId.toString());

  const files = await File.find({
    parentFolderId: { $in: folderIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).select("_id");

  for (const file of files) {
    fileIds.add(file._id.toString());
  }

  return Array.from(fileIds);
}

export async function calculateFolderSize(folderId, userId) {
  const folderIds = await getDescendantFolderIds(folderId);
  folderIds.push(folderId.toString());

  const files = await File.find({
    parentFolderId: {
      $in: folderIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
    isDeleted: false,
  });

  let totalSize = 0;
  for (const file of files) {
    totalSize += file.size;
  }

  return {
    totalSize,
    fileCount: files.length,
    folderCount: folderIds.length - 1,
  };
}

export async function isDescendant(folderId, potentialAncestorId, userId) {
  let currentId = folderId;

  while (currentId) {
    const folder = await Folder.findOne({
      _id: currentId,
      userId,
      isDeleted: false,
    }).select("parentFolderId");

    if (!folder) return false;
    if (folder.parentFolderId?.toString() === potentialAncestorId.toString()) {
      return true;
    }
    currentId = folder.parentFolderId;
  }

  return false;
}

export async function buildBreadcrumb(folderId, userId) {
  const breadcrumb = [];

  async function collect(id) {
    const folder = await Folder.findOne({
      _id: id,
      userId,
    }).select("name parentFolderId");

    if (!folder) return;

    breadcrumb.unshift({ _id: folder._id, name: folder.name });

    if (folder.parentFolderId) {
      await collect(folder.parentFolderId);
    }
  }

  await collect(folderId);
  return breadcrumb;
}

export async function recalculateFolderPath(folder, newPath, newDepth) {
  folder.path = newPath;
  folder.depth = newDepth;
  await folder.save();

  const children = await Folder.find({
    parentFolderId: folder._id,
    isDeleted: false,
  });

  for (const child of children) {
    const childPath = `${newPath}/${child.name}`;
    await recalculateFolderPath(child, childPath, newDepth + 1);
  }
}

export async function updateFolderMetadata(folderId) {
  const [fileCount, folderCount] = await Promise.all([
    File.countDocuments({ parentFolderId: folderId, isDeleted: false }),
    Folder.countDocuments({ parentFolderId: folderId, isDeleted: false }),
  ]);

  const files = await File.find({ parentFolderId: folderId, isDeleted: false });
  let totalSize = 0;
  for (const file of files) {
    totalSize += file.size;
  }

  await Folder.findByIdAndUpdate(folderId, {
    "metadata.itemCount": fileCount + folderCount,
    "metadata.totalSize": totalSize,
  });
}

export function sanitizeFolderName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 255);
}

export async function getFolderContentsRecursive(folderId) {
  const allFileIds = new Set();
  const allFolderIds = new Set();

  async function collectRecursive(id) {
    allFolderIds.add(id.toString());

    const files = await File.find({ parentFolderId: id, isDeleted: false }).select("_id");
    for (const file of files) {
      allFileIds.add(file._id.toString());
    }

    const subfolders = await Folder.find({ parentFolderId: id, isDeleted: false }).select("_id");
    for (const subfolder of subfolders) {
      await collectRecursive(subfolder._id);
    }
  }

  await collectRecursive(folderId);

  return {
    fileIds: Array.from(allFileIds),
    folderIds: Array.from(allFolderIds),
  };
}

export async function deleteFilesFromS3(fileIds) {
  const { deleteFromS3 } = await import("../services/s3.service.js");
  const files = await File.find({ _id: { $in: fileIds } }).select("s3Key");

  for (const file of files) {
    await deleteFromS3(file.s3Key).catch(() => undefined);
  }
}