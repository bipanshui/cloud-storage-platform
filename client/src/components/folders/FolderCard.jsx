import { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
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

function FolderCard({ folder, isSelected, onSelect }) {
  const navigate = useNavigate();
  const { navigateToFolder } = useFile();
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

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect?.(folder.id);
  };

  const handleAction = (actionId) => {
    switch (actionId) {
      case "open":
        navigateToFolder(folder.id, folder.name);
        break;
      case "rename":
        window.dispatchEvent(new CustomEvent("open-folder-rename-modal", { detail: { folder } }));
        break;
      case "move":
        window.dispatchEvent(new CustomEvent("open-folder-move-modal", { detail: { folder } }));
        break;
      case "star":
        handleStarClick({ stopPropagation: () => {} });
        break;
      case "color":
        window.dispatchEvent(new CustomEvent("open-folder-color-modal", { detail: { folder } }));
        break;
      case "size":
        window.dispatchEvent(new CustomEvent("open-folder-size-modal", { detail: { folder } }));
        break;
      case "trash":
        window.dispatchEvent(new CustomEvent("open-folder-delete-modal", { detail: { folder } }));
        break;
      default:
        break;
    }
    setShowMenu(false);
  };

  const menuItems = [
    { id: "open", label: "Open" },
    { type: "separator" },
    { id: "rename", label: "Rename" },
    { id: "move", label: "Move to..." },
    { id: "star", label: folder.isStarred ? "Remove from starred" : "Add to starred" },
    { id: "color", label: "Change color" },
    { id: "size", label: "Get folder size" },
    { type: "separator" },
    { id: "trash", label: "Move to trash" },
  ];

  const adjustedPosition = {
    x: Math.min(menuPosition.x, window.innerWidth - 200),
    y: Math.min(menuPosition.y, window.innerHeight - 300),
  };

  return (
    <>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={clsx(
          "group relative flex cursor-pointer flex-col rounded-lg border p-4 transition hover:border-neutral-400",
          isSelected
            ? "border-neutral-900 bg-neutral-50"
            : "border-neutral-200 bg-white"
        )}
      >
        <div className="absolute left-2 top-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
        </div>

        <button
          onClick={handleStarClick}
          className="absolute right-2 top-2 z-10 rounded-full p-1 opacity-0 transition hover:bg-neutral-100 group-hover:opacity-100"
        >
          {isStarred ? (
            <HiFolder className="h-5 w-5 text-neutral-600" />
          ) : (
            <HiFolder className="h-5 w-5 text-neutral-400" />
          )}
        </button>

        <div className="mt-4 flex justify-center">
          <div
            className={clsx(
              "flex items-center justify-center rounded-lg",
              colorClass
            )}
            style={{ width: 64, height: 64 }}
          >
            <HiFolder className="h-8 w-8" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p
            className="truncate text-sm font-medium text-neutral-900"
            title={folder.name}
          >
            {folder.name}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {folder.itemCount || 0} items
          </p>
        </div>
      </div>

      {showMenu && (
        <div
          className="fixed z-50 w-56 rounded-lg border border-neutral-200 bg-white py-1 shadow-flat"
          style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
        >
          {menuItems.map((item, index) =>
            item.type === "separator" ? (
              <hr key={index} className="my-1 border-neutral-100" />
            ) : (
              <button
                key={item.id}
                onClick={() => handleAction(item.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
}

FolderCard.propTypes = {
  folder: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    isStarred: PropTypes.bool,
    itemCount: PropTypes.number,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default FolderCard;