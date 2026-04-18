import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Modal from "@/components/common/Modal";
import { fileService } from "@/services/fileService";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/helpers";
import { useFile } from "@/hooks/useFile";

function DeleteConfirmModal({ file, isOpen, onClose, isPermanent = false }) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshFiles } = useFile();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (isPermanent && confirmText !== file.name) {
      toast.error("Type the file name to confirm");
      return;
    }

    setIsLoading(true);
    try {
      if (isPermanent) {
        await fileService.permanentlyDeleteFile(file.id);
        toast.success("File permanently deleted");
      } else {
        await fileService.deleteFile(file.id);
        toast.success("File moved to trash");
      }
      refreshFiles();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPermanent ? "Delete permanently" : "Move to trash"}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-neutral-600">
          {isPermanent
            ? `Are you sure you want to permanently delete "${file?.name}"? This action cannot be undone.`
            : `Are you sure you want to move "${file?.name}" to trash?`}
        </p>

        {isPermanent && (
          <div>
            <p className="mb-2 text-sm text-neutral-500">
              Type <span className="font-medium text-neutral-900">{file?.name}</span> to confirm
            </p>
            <input
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="Type file name"
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading || (isPermanent && confirmText !== file?.name)}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isLoading ? "Deleting..." : isPermanent ? "Delete permanently" : "Move to Trash"}
        </button>
      </div>
    </Modal>
  );
}

DeleteConfirmModal.propTypes = {
  file: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isPermanent: PropTypes.bool,
};

export default DeleteConfirmModal;