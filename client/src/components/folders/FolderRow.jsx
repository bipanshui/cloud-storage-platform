import { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import toast from "react-hot-toast";
import { folderService } from "@/services/folderService";
import { useFile } from "@/hooks/useFile";
import { HiFolder } from "react-icons/hi2";

const colorMap = {
  null: "bg-neutral-100 text-neutral-600",
  "#3B82F6": "bg-blue-100 text-blue-600",
  "#22C55E": "bg-green-100 text-green-600",
  "#EF4444": "bg-red-100 text-red-600",
  "#EAB308": "bg-yellow-100 text-yellow-600",
  "#A855F7": "bg-purple-100 text-purple-600",
  "#EC4899": "bg-pink-100 text-pink-600",
  "#F97316": "bg-orange-100 text-orange-600",
};

function FolderRow({ folder, isSelected, onSelect }) {
  const { navigateToFolder, refreshCurrentDirectory } = useFile();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isStarred, setIsStarred] = useState(folder.isStarred || false);

  const colorClass = colorMap[folder.color] || colorMap.null;

  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect?.(folder.id);
    } else {
      navigateToFolder(folder.id, folder.name);
    }
  };

  const handleDoubleClick = () => {
    navigateToFolder(folder.id, folder.name);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleStarClick = async (e) => {
    e.stopPropagation();
    try {
      await folderService.toggleStarFolder(folder.id);
      setIsStarred(!isStarred);
      toast.success(isStarred ? "Removed from starred" : "Added to starred");
    } catch (error) {
      toast.error("Failed to update starred status");
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.right, y: rect.top + 40 });
    setShowMenu(true);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect?.(folder.id);
  };

  return (
    <>
      <tr
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={clsx(
          "cursor-pointer border-b border-neutral-100 transition hover:bg-neutral-50",
          isSelected && "bg-neutral-50"
        )}
      >
        <td className="whitespace-nowrap px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            />
            <div
              className={clsx(
                "flex items-center justify-center rounded-lg",
                colorClass
              )}
              style={{ width: 32, height: 32 }}
            >
              <HiFolder className="h-4 w-4" />
            </div>
            <span className="font-medium text-neutral-900 truncate max-w-[200px]">
              {folder.name}
            </span>
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-3">
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
            Folder
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
          {folder.itemCount || 0} items
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
          {folder.updatedAt
            ? new Date(folder.updatedAt).toLocaleDateString()
            : "-"}
        </td>
        <td className="whitespace-nowrap px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStarClick}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            >
              {isStarred ? (
                <HiFolder className="h-5 w-5 text-neutral-600" />
              ) : (
                <HiFolder className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleMenuClick}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    </>
  );
}

FolderRow.propTypes = {
  folder: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    isStarred: PropTypes.bool,
    itemCount: PropTypes.number,
    updatedAt: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default FolderRow;