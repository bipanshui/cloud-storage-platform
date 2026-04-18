import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFile } from "@/hooks/useFile";
import FileGrid from "@/components/files/FileGrid";
import FileList from "@/components/files/FileList";
import FileToolbar from "@/components/files/FileToolbar";
import Breadcrumb from "@/components/files/Breadcrumb";
import UploadButton from "@/components/files/UploadButton";
import UploadDropzone from "@/components/files/UploadDropzone";
import UploadProgress from "@/components/files/UploadProgress";
import RenameModal from "@/components/files/RenameModal";
import MoveModal from "@/components/files/MoveModal";
import DeleteConfirmModal from "@/components/files/DeleteConfirmModal";
import CreateFolderModal from "@/components/folders/CreateFolderModal";

function FilesPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { 
    viewMode, 
    fetchFolderContents, 
    createFolder,
    refreshCurrentDirectory,
    selectedItems,
    breadcrumb,
    folders,
    files,
    selectItem,
    deselectItem,
    clearSelection,
  } = useFile();
  
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [renameModalFile, setRenameModalFile] = useState(null);
  const [moveModalFile, setMoveModalFile] = useState(null);
  const [deleteModalFile, setDeleteModalFile] = useState(null);
  const [folderCount, setFolderCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);

  useEffect(() => {
    const folderIdParam = folderId || null;
    fetchFolderContents(folderIdParam);
  }, [folderId]);

  useEffect(() => {
    setFolderCount(folders?.length || 0);
    setFileCount(files?.length || 0);
  }, [folders, files]);

  useEffect(() => {
    const handleOpenRename = (e) => setRenameModalFile(e.detail);
    const handleOpenMove = (e) => setMoveModalFile(e.detail);
    const handleOpenDelete = (e) => setDeleteModalFile(e.detail);

    window.addEventListener("open-rename-modal", handleOpenRename);
    window.addEventListener("open-move-modal", handleOpenMove);
    window.addEventListener("open-delete-modal", handleOpenDelete);

    return () => {
      window.removeEventListener("open-rename-modal", handleOpenRename);
      window.removeEventListener("open-move-modal", handleOpenMove);
      window.removeEventListener("open-delete-modal", handleOpenDelete);
    };
  }, []);

  const handleCreateFolderSubmit = async (name, color) => {
    setIsCreatingFolder(true);
    try {
      await createFolder(name, color);
      setShowCreateFolder(false);
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const totalItems = folderCount + fileCount;
  const itemCountText = totalItems === 0 
    ? "No items" 
    : totalItems === 1 
      ? "1 item"
      : `${folderCount} folders, ${fileCount} files`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Breadcrumb />
          <UploadButton onCreateFolder={() => setShowCreateFolder(true)} />
        </div>
        
        <FileToolbar 
          onCreateFolder={() => setShowCreateFolder(true)}
          itemCount={itemCountText}
        />
      </div>

      <UploadDropzone>
        {viewMode === "grid" ? <FileGrid /> : <FileList />}
      </UploadDropzone>

      <UploadProgress />

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSubmit={handleCreateFolderSubmit}
        isLoading={isCreatingFolder}
      />

      <RenameModal
        file={renameModalFile}
        isOpen={!!renameModalFile}
        onClose={() => setRenameModalFile(null)}
      />

      <MoveModal
        file={moveModalFile}
        isOpen={!!moveModalFile}
        onClose={() => setMoveModalFile(null)}
      />

      <DeleteConfirmModal
        file={deleteModalFile}
        isOpen={!!deleteModalFile}
        onClose={() => setDeleteModalFile(null)}
      />
    </div>
  );
}

export default FilesPage;