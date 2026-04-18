import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useFile } from "@/hooks/useFile";
import { HiMagnifyingGlass, HiFunnel, HiViewColumns, HiOutlineSquare3Stack3D, HiXMark } from "react-icons/hi2";

const filterOptions = [
  { value: null, label: "All" },
  { value: "image", label: "Images" },
  { value: "document", label: "Documents" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
  { value: "archive", label: "Archives" },
];

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "date", label: "Date modified" },
  { value: "size", label: "Size" },
];

function FileToolbar({ onCreateFolder, itemCount = "No items" }) {
  const {
    sortBy,
    sortOrder,
    viewMode,
    searchQuery,
    filterType,
    selectedItems,
    clearSelection,
    setSort,
    setViewMode,
    setSearchQuery,
    setFilterType,
  } = useFile();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSort(newSortBy, sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSort(newSortBy, "asc");
    }
  };

  if (selectedItems.length > 0) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={clearSelection}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
          >
            <HiXMark className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-neutral-900">
            {selectedItems.length} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Download
          </button>
          <button className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Move
          </button>
          <button className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Delete
          </button>
          <button className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Star
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
        <span className="text-sm text-neutral-500">
          {itemCount}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-48 rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="relative">
          <select
            value={filterType || ""}
            onChange={(e) => setFilterType(e.target.value || null)}
            className="appearance-none rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-8 text-sm text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            {filterOptions.map((option) => (
              <option key={option.label} value={option.value || ""}>
                {option.label}
              </option>
            ))}
          </select>
          <HiFunnel className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="appearance-none rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-8 text-sm text-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <HiFunnel className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>

        <div className="flex rounded-lg border border-neutral-200 bg-white p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={clsx(
              "rounded-lg p-1.5 transition",
              viewMode === "grid"
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <HiOutlineSquare3Stack3D className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={clsx(
              "rounded-lg p-1.5 transition",
              viewMode === "list"
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <HiViewColumns className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

FileToolbar.propTypes = {
  onCreateFolder: PropTypes.func,
  itemCount: PropTypes.string,
};

export default FileToolbar;