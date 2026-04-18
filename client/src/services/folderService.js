import { api } from "./api";

export const folderService = {
  createFolder(name, parentFolderId = null, color = null) {
    return api.post("/folders", {
      name,
      parentFolderId,
      color,
    });
  },

  getFolderById(id) {
    return api.get(`/folders/${id}`);
  },

  getFolderContents(folderId = null, params = {}) {
    const queryParams = new URLSearchParams();
    if (folderId) {
      queryParams.append("folderId", folderId);
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

    return api.get(`/folders/contents?${queryParams.toString()}`);
  },

  getFolderTree() {
    return api.get("/folders/tree");
  },

  getBreadcrumb(folderId) {
    if (!folderId) {
      return api.get("/folders/breadcrumb");
    }
    return api.get(`/folders/${folderId}/breadcrumb`);
  },

  renameFolder(id, name) {
    return api.patch(`/folders/${id}/rename`, { name });
  },

  moveFolder(id, newParentFolderId) {
    return api.patch(`/folders/${id}/move`, { newParentFolderId });
  },

  toggleStarFolder(id) {
    return api.patch(`/folders/${id}/star`);
  },

  deleteFolder(id) {
    return api.delete(`/folders/${id}`);
  },

  restoreFolder(id) {
    return api.patch(`/folders/${id}/restore`);
  },

  permanentlyDeleteFolder(id) {
    return api.delete(`/folders/${id}/permanent`);
  },

  updateFolderColor(id, color) {
    return api.patch(`/folders/${id}/color`, { color });
  },

  getFolderSize(id) {
    return api.get(`/folders/${id}/size`);
  },
};