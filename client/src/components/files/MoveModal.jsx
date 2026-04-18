import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Modal from "@/components/common/Modal";
import FolderTree from "@/components/folders/FolderTree";
import { fileService } from "@/services/fileService";
import { folderService } from "@/services/folderService";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/helpers";
import { useFile } from "@/hooks/useFile";

function MoveModal({ file, isOpen, onClose }) {
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshCurrentDirectory, currentFolderId } = useFile();

  const handleMove = async () => {
    if (selectedFolderId === null || selectedFolderId === undefined) {
      toast.error("Please select a destination folder");
      return;
    }

    if (file?.isFolder && selectedFolderId === file.id) {
      toast.error("Cannot move a folder into itself");
      return;
    }

    if (file?.parentFolderId === selectedFolderId) {
      toast.error("Cannot move to the same location");
      return;
    }

    setIsLoading(true);
    try {
      if (file?.isFolder) {
        await folderService.moveFolder(file.id, selectedFolderId);
        toast.success("Folder moved successfully");
      } else {
        await fileService.moveFile(file.id, selectedFolderId);
        toast.success("File moved successfully");
      }
      refreshCurrentDirectory();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const disabledIds = file?.isFolder ? [file.id] : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Move to..." size="md">
      <div className="max-h-80 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <FolderTree
          selectedId={selectedFolderId}
          onSelect={setSelectedFolderId}
          disabledIds={disabledIds}
          currentFolderId={currentFolderId}
        />
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          onClick={handleMove}
          disabled={!selectedFolderId || isLoading}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isLoading ? "Moving..." : "Move"}
        </button>
      </div>
    </Modal>
  );
}

MoveModal.propTypes = {
  file: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MoveModal;