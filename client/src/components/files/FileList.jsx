import PropTypes from "prop-types";
import clsx from "clsx";
import { useFile } from "@/hooks/useFile";
import FileRow from "./FileRow";
import FolderRow from "../folders/FolderRow";
import Spinner from "@/components/common/Spinner";

function FileList() {
  const { folders, files, isLoading, selectedItems, selectItem, deselectItem, selectAll, clearSelection } = useFile();

  const handleSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      deselectItem(itemId);
    } else {
      selectItem(itemId);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === folders.length + files.length) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="w-12 px-4 py-3">
                <div className="h-4 w-4 rounded bg-neutral-200 animate-pulse" />
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse" />
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 w-16 rounded bg-neutral-200 animate-pulse" />
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 w-16 rounded bg-neutral-200 animate-pulse" />
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 w-20 rounded bg-neutral-200 animate-pulse" />
              </th>
              <th className="w-24 px-4 py-3">
                <div className="h-4 w-8 rounded bg-neutral-200 animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={index} className="border-b border-neutral-100">
                <td className="px-4 py-4">
                  <div className="h-4 w-4 rounded bg-neutral-200 animate-pulse" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-neutral-200 animate-pulse" />
                    <div className="h-4 w-32 rounded bg-neutral-200 animate-pulse" />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-16 rounded bg-neutral-200 animate-pulse" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-20 rounded bg-neutral-200 animate-pulse" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-5 rounded bg-neutral-200 animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

  const totalItems = folders.length + files.length;
  const allSelected = selectedItems.length === totalItems && totalItems > 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
              Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
              Modified
            </th>
            <th className="w-24 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              isSelected={selectedItems.includes(folder.id)}
              onSelect={handleSelect}
            />
          ))}
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              isSelected={selectedItems.includes(file.id)}
              onSelect={handleSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FileList;