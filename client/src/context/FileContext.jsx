import PropTypes from "prop-types";
import { createContext, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fileService } from "@/services/fileService";
import { folderService } from "@/services/folderService";
import { getErrorMessage } from "@/utils/helpers";

export const FileContext = createContext(null);

export function FileProvider({ children }) {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([{ id: null, name: "My Drive" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    limit: 0,
    percentage: 0,
  });

  const fetchFolderContents = useCallback(
    async (folderId = null) => {
      setIsLoading(true);
      try {
        const response = await folderService.getFolderContents(folderId, {
          sortBy,
          sortOrder,
          search: searchQuery,
          type: filterType,
        });
        
        const data = response.data.data;
        setFolders(data.folders || []);
        setFiles(data.files || []);
        setBreadcrumb(data.breadcrumb || [{ id: null, name: "My Drive" }]);
        setCurrentFolderId(folderId);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [sortBy, sortOrder, searchQuery, filterType]
  );

  const navigateToFolder = useCallback(
    (folderId, folderName = null) => {
      if (folderId === null || folderId === undefined) {
        navigate("/files");
      } else {
        navigate(`/files/${folderId}`);
      }
    },
    [navigate]
  );

  const navigateUp = useCallback(() => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = [...breadcrumb];
      newBreadcrumb.pop();
      const parentFolder = newBreadcrumb[newBreadcrumb.length - 1];
      navigate(parentFolder.id === null ? "/files" : `/files/${parentFolder.id}`);
    }
  }, [breadcrumb, navigate]);

  const navigateToRoot = useCallback(() => {
    navigate("/files");
  }, [navigate]);

  const createFolder = useCallback(
    async (name, color = null) => {
      try {
        await folderService.createFolder(name, currentFolderId, color);
        toast.success(`Folder "${name}" created`);
        fetchFolderContents(currentFolderId);
      } catch (error) {
        toast.error(getErrorMessage(error));
        throw error;
      }
    },
    [currentFolderId, fetchFolderContents]
  );

  const refreshCurrentDirectory = useCallback(() => {
    fetchFolderContents(currentFolderId);
  }, [currentFolderId, fetchFolderContents]);

  const setSort = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const selectItem = useCallback((itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev : [...prev, itemId]
    );
  }, []);

  const deselectItem = useCallback((itemId) => {
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
  }, []);

  const selectAll = useCallback(() => {
    const allIds = [
      ...folders.map((f) => f.id),
      ...files.map((f) => f.id),
    ];
    setSelectedItems(allIds);
  }, [folders, files]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const updateStorageInfo = useCallback(async () => {
    try {
      const response = await fileService.getStorageInfo();
      setStorageInfo(response.data.data);
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
    }
  }, []);

  const addToUploadQueue = useCallback((fileData) => {
    setUploadQueue((prev) => [...prev, fileData]);
  }, []);

  const updateUploadProgress = useCallback((fileId, progress) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === fileId ? { ...item, progress } : item
      )
    );
  }, []);

  const updateUploadStatus = useCallback((fileId, status, error = null) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === fileId ? { ...item, status, error } : item
      )
    );
  }, []);

  const removeFromUploadQueue = useCallback((fileId) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== fileId));
  }, []);

  const value = {
    folders,
    files,
    currentFolderId,
    breadcrumb,
    isLoading,
    pagination,
    sortBy,
    sortOrder,
    viewMode,
    searchQuery,
    filterType,
    selectedItems,
    uploadQueue,
    storageInfo,
    fetchFolderContents,
    navigateToFolder,
    navigateUp,
    navigateToRoot,
    createFolder,
    refreshCurrentDirectory,
    setSort,
    setViewMode,
    setSearchQuery,
    setFilterType,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    updateStorageInfo,
    addToUploadQueue,
    updateUploadProgress,
    updateUploadStatus,
    removeFromUploadQueue,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}

FileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};