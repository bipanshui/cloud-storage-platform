import { api } from "./api";

export const fileService = {
  uploadFile(file, parentFolderId = null, onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    if (parentFolderId) {
      formData.append("parentFolderId", parentFolderId);
    }

    return api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  uploadMultipleFiles(files, parentFolderId = null, onProgress) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    if (parentFolderId) {
      formData.append("parentFolderId", parentFolderId);
    }

    return api.post("/files/upload-multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  getFiles(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.parentFolderId) {
      queryParams.append("parentFolderId", params.parentFolderId);
    }
    if (params.search) {
      queryParams.append("search", params.search);
    }
    if (params.type) {
      queryParams.append("type", params.type);
    }
    if (params.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }
    if (params.page) {
      queryParams.append("page", params.page);
    }
    if (params.limit) {
      queryParams.append("limit", params.limit);
    }

    return api.get(`/files?${queryParams.toString()}`);
  },

  getRecentFiles() {
    return api.get("/files/recent");
  },

  getStarredFiles() {
    return api.get("/files/starred");
  },

  getTrashFiles() {
    return api.get("/files/trash");
  },

  getFileById(id) {
    return api.get(`/files/${id}`);
  },

  downloadFile(id) {
    return api.get(`/files/${id}/download`);
  },

  renameFile(id, name) {
    return api.patch(`/files/${id}/rename`, { name });
  },

  moveFile(id, newParentFolderId) {
    return api.patch(`/files/${id}/move`, { newParentFolderId });
  },

  copyFile(id) {
    return api.post(`/files/${id}/copy`);
  },

  toggleStar(id) {
    return api.patch(`/files/${id}/star`);
  },

  deleteFile(id) {
    return api.delete(`/files/${id}`);
  },

  restoreFile(id) {
    return api.patch(`/files/${id}/restore`);
  },

  permanentlyDeleteFile(id) {
    return api.delete(`/files/${id}/permanent`);
  },

  emptyTrash() {
    return api.delete("/files/trash/empty");
  },

  getStorageInfo() {
    return api.get("/users/storage");
  },

  createFolder(name, parentFolderId = null) {
    return api.post("/files/folder", {
      name,
      parentFolderId,
    });
  },

  getFolders(parentFolderId = null) {
    const queryParams = parentFolderId
      ? `?parentFolderId=${parentFolderId}`
      : "";
    return api.get(`/files/folders${queryParams}`);
  },
};