import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import { useFile } from "@/hooks/useFile";
import toast from "react-hot-toast";
import { fileService } from "@/services/fileService";
import clsx from "clsx";

function UploadDropzone({ className }) {
  const [isDragging, setIsDragging] = useState(false);
  const { addToUploadQueue, updateUploadProgress, updateUploadStatus, removeFromUploadQueue, currentFolder, refreshFiles } = useFile();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      for (const file of acceptedFiles) {
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
    },
    [addToUploadQueue, updateUploadProgress, updateUploadStatus, removeFromUploadQueue, currentFolder, refreshFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".txt"],
      "video/*": [".mp4", ".webm", ".mov"],
      "audio/*": [".mp3", ".wav"],
      "application/zip": [".zip"],
    },
    maxSize: 100 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div {...getRootProps()} className={clsx("relative", className)}>
      <input {...getInputProps()} />
      
      {isDragActive && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/5">
          <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-neutral-400 bg-white/95 px-16 py-12">
            <svg
              className="h-16 w-16 text-neutral-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-neutral-700">
              Drop files here to upload
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

UploadDropzone.propTypes = {
  className: PropTypes.string,
};

export default UploadDropzone;