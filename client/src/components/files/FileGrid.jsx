import PropTypes from "prop-types";
import clsx from "clsx";
import { useFile } from "@/hooks/useFile";
import FileCard from "./FileCard";
import FolderCard from "../folders/FolderCard";
import Spinner from "@/components/common/Spinner";

function FileGrid() {
  const { folders, files, isLoading, selectedItems, selectItem, deselectItem } = useFile();

  const handleSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      deselectItem(itemId);
    } else {
      selectItem(itemId);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="mx-auto h-16 w-16 rounded-lg bg-neutral-200" />
            <div className="mt-4 space-y-2">
              <div className="mx-auto h-4 w-3/4 rounded bg-neutral-200" />
              <div className="mx-auto h-3 w-1/2 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-neutral-100 p-6">
          <svg
            className="h-12 w-12 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-neutral-900">
          No files yet
        </h3>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Upload files or create folders to get started
        </p>
      </div>
    );
  }

  const hasFolders = folders.length > 0;
  const hasFiles = files.length > 0;

  return (
    <div className="space-y-6">
      {hasFolders && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-neutral-500">
            Folders
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                isSelected={selectedItems.includes(folder.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {hasFiles && (
        <div>
          {hasFolders && (
            <h3 className="mb-3 text-sm font-medium text-neutral-500">
              Files
            </h3>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedItems.includes(file.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileGrid;