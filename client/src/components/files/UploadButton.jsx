import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { useFile } from "@/hooks/useFile";
import toast from "react-hot-toast";
import { fileService } from "@/services/fileService";
import { HiArrowUpTray, HiFolderPlus } from "react-icons/hi2";
import clsx from "clsx";

function UploadButton({ onCreateFolder }) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const { addToUploadQueue, updateUploadProgress, updateUploadStatus, removeFromUploadQueue, currentFolder, refreshFiles } = useFile();

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      addToUploadQueue({
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading",
      });

      try {
        await fileService.uploadFile(
          file,
          currentFolder,
          (progress) => {
            updateUploadProgress(fileId, progress);
          }
        );
        updateUploadStatus(fileId, "complete");
        toast.success(`${file.name} uploaded successfully`);
        refreshFiles();
        setTimeout(() => removeFromUploadQueue(fileId), 5000);
      } catch (error) {
        updateUploadStatus(fileId, "error", error.message);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    event.target.value = "";
    setIsOpen(false);
  };

  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const uploadPromises = files.map(async (file) => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      addToUploadQueue({
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading",
      });

      try {
        await fileService.uploadFile(
          file,
          currentFolder,
          (progress) => {
            updateUploadProgress(fileId, progress);
          }
        );
        updateUploadStatus(fileId, "complete");
        toast.success(`${file.name} uploaded successfully`);
        refreshFiles();
        setTimeout(() => removeFromUploadQueue(fileId), 5000);
      } catch (error) {
        updateUploadStatus(fileId, "error", error.message);
        toast.error(`Failed to upload ${file.name}`);
      }
    });

    await Promise.all(uploadPromises);

    event.target.value = "";
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        )}
      >
        <HiArrowUpTray className="h-5 w-5" />
        <span>Upload</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-flat">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <HiArrowUpTray className="h-5 w-5 text-neutral-400" />
              Upload files
            </button>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <HiArrowUpTray className="h-5 w-5 text-neutral-400" />
              Upload folder
            </button>
            <hr className="my-1 border-neutral-100" />
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateFolder?.();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <HiFolderPlus className="h-5 w-5 text-neutral-400" />
              New folder
            </button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        webkitdirectory=""
        className="hidden"
        onChange={handleFolderSelect}
      />
    </div>
  );
}

UploadButton.propTypes = {
  onCreateFolder: PropTypes.func,
};

export default UploadButton;