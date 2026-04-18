import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "@/components/common/Modal";
import FolderColorPicker from "./FolderColorPicker";

function CreateFolderModal({ isOpen, onClose, onSubmit, isLoading = false }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setColor(null);
      setError("");
      setTimeout(() => {
        const input = document.getElementById("folder-name-input");
        if (input) input.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Folder name cannot be empty");
      return;
    }

    if (trimmedName.length > 255) {
      setError("Folder name is too long (max 255 characters)");
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_.]+$/.test(trimmedName)) {
      setError("Folder name contains invalid characters");
      return;
    }

    setError("");
    onSubmit(trimmedName, color);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new folder" size="sm">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="folder-name-input" className="block text-sm font-medium text-neutral-700">
              Folder name
            </label>
            <input
              id="folder-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="New folder"
              className="mt-1 w-full rounded-lg border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            {error && <p className="mt-1 text-sm text-neutral-500">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Color (optional)
            </label>
            <div className="mt-2">
              <FolderColorPicker selectedColor={color} onSelect={setColor} />
            </div>
          </div>
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
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

CreateFolderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default CreateFolderModal;