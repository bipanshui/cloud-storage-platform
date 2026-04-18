import { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { useFile } from "@/hooks/useFile";
import { fileService } from "@/services/fileService";
import { formatBytes } from "@/utils/helpers";
import FileIcon from "./FileIcon";
import FileContextMenu from "./FileContextMenu";
import { HiStar, HiOutlineStar } from "react-icons/hi2";

function FileCard({ file, isSelected, onSelect }) {
  const navigate = useNavigate();
  const { navigateToFolder } = useFile();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isStarred, setIsStarred] = useState(file.isStarred);

  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect?.(file.id);
    } else if (file.isFolder) {
      navigateToFolder(file.id, file.name);
    } else {
      navigate(`/files/preview/${file.id}`);
    }
  };

  const handleDoubleClick = async () => {
    if (file.isFolder) {
      navigateToFolder(file.id, file.name);
    } else {
      try {
        const response = await fileService.downloadFile(file.id);
        const downloadUrl = response.data.data.downloadUrl;
        window.open(downloadUrl, "_blank");
        toast.success("Download started");
      } catch (error) {
        toast.error("Failed to download file");
      }
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleStarClick = async (e) => {
    e.stopPropagation();
    try {
      await fileService.toggleStar(file.id);
      setIsStarred(!isStarred);
      toast.success(isStarred ? "Removed from starred" : "Added to starred");
    } catch (error) {
      toast.error("Failed to update starred status");
    }
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect?.(file.id);
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
            <HiStar className="h-5 w-5 text-neutral-600" />
          ) : (
            <HiOutlineStar className="h-5 w-5 text-neutral-400" />
          )}
        </button>

        <div className="mt-4 flex justify-center">
          <FileIcon
            mimeType={file.mimeType}
            size="lg"
            isFolder={file.isFolder}
          />
        </div>

        <div className="mt-4 text-center">
          <p
            className="truncate text-sm font-medium text-neutral-900"
            title={file.name}
          >
            {file.name}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {file.isFolder
              ? `${file.itemCount || 0} items`
              : formatBytes(file.size)}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {file.updatedAt
              ? formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })
              : ""}
          </p>
        </div>
      </div>

      {showMenu && (
        <FileContextMenu
          file={file}
          position={menuPosition}
          onClose={() => setShowMenu(false)}
        />
      )}
    </>
  );
}

FileCard.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    mimeType: PropTypes.string,
    size: PropTypes.number,
    isFolder: PropTypes.bool,
    isStarred: PropTypes.bool,
    updatedAt: PropTypes.string,
    itemCount: PropTypes.number,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default FileCard;