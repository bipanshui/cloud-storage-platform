import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "@/components/common/Modal";
import { fileService } from "@/services/fileService";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/helpers";
import { useFile } from "@/hooks/useFile";

function RenameModal({ file, isOpen, onClose }) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshFiles } = useFile();

  useEffect(() => {
    if (file) {
      const ext = file.name.includes(".") 
        ? file.name.slice(file.name.lastIndexOf("."))
        : "";
      const baseName = file.name.includes(".")
        ? file.name.slice(0, file.name.lastIndexOf("."))
        : file.name;
      setName(baseName);
      setTimeout(() => {
        const input = document.getElementById("rename-input");
        if (input) {
          input.focus();
          input.setSelectionRange(0, input.value.length);
        }
      }, 100);
    }
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Name cannot be empty");
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_.]+$/.test(trimmedName)) {
      toast.error("Name contains invalid characters");
      return;
    }

    setIsLoading(true);
    try {
      const ext = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : "";
      await fileService.renameFile(file.id, trimmedName + ext);
      toast.success("File renamed successfully");
      refreshFiles();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename file" size="sm">
      <form onSubmit={handleSubmit}>
        <input
          id="rename-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          placeholder="Enter new name"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

RenameModal.propTypes = {
  file: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RenameModal;