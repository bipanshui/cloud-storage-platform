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
import { HiStar, HiOutlineStar, HiEllipsisVertical } from "react-icons/hi2";

function FileRow({ file, isSelected, onSelect }) {
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

  const handleMenuClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.right, y: rect.top + 40 });
    setShowMenu(true);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect?.(file.id);
  };

  const getTypeBadge = () => {
    if (file.isFolder) return "Folder";
    if (file.mimeType?.startsWith("image/")) return "Image";
    if (file.mimeType?.startsWith("video/")) return "Video";
    if (file.mimeType?.startsWith("audio/")) return "Audio";
    if (file.mimeType?.includes("pdf")) return "PDF";
    if (file.mimeType?.includes("word") || file.mimeType?.includes("document")) return "Document";
    if (file.mimeType?.includes("excel") || file.mimeType?.includes("spreadsheet")) return "Spreadsheet";
    return "File";
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
            <FileIcon
              mimeType={file.mimeType}
              size="sm"
              isFolder={file.isFolder}
            />
            <span className="font-medium text-neutral-900 truncate max-w-[200px]">
              {file.name}
            </span>
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-3">
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
            {getTypeBadge()}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
          {file.isFolder ? `${file.itemCount || 0} items` : formatBytes(file.size)}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
          {file.updatedAt
            ? formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })
            : "-"}
        </td>
        <td className="whitespace-nowrap px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStarClick}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            >
              {isStarred ? (
                <HiStar className="h-5 w-5 text-neutral-600" />
              ) : (
                <HiOutlineStar className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleMenuClick}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            >
              <HiEllipsisVertical className="h-5 w-5" />
            </button>
          </div>
        </td>
      </tr>

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

FileRow.propTypes = {
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

export default FileRow;