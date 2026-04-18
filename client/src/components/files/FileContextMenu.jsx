import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fileService } from "@/services/fileService";
import { useFile } from "@/hooks/useFile";
import clsx from "clsx";
import {
  HiEye,
  HiArrowDownTray,
  HiPencil,
  HiFolderArrowDown,
  HiDocumentDuplicate,
  HiStar,
  HiShare,
  HiTrash,
} from "react-icons/hi2";

const menuItems = [
  { id: "open", label: "Open", icon: HiEye },
  { id: "download", label: "Download", icon: HiArrowDownTray },
  { type: "separator" },
  { id: "rename", label: "Rename", icon: HiPencil },
  { id: "move", label: "Move to...", icon: HiFolderArrowDown },
  { id: "copy", label: "Make a copy", icon: HiDocumentDuplicate },
  { type: "separator" },
  { id: "star", label: "Star", icon: HiStar },
  { id: "share", label: "Share", icon: HiShare },
  { type: "separator" },
  { id: "trash", label: "Move to trash", icon: HiTrash },
];

function FileContextMenu({ file, position, onClose }) {
  const navigate = useNavigate();
  const { refreshFiles } = useFile();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleAction = async (actionId) => {
    switch (actionId) {
      case "open":
        if (file.isFolder) {
          navigate(`/files/${file.id}`);
        } else {
          navigate(`/files/preview/${file.id}`);
        }
        break;

      case "download":
        try {
          const response = await fileService.downloadFile(file.id);
          const downloadUrl = response.data.data.downloadUrl;
          window.open(downloadUrl, "_blank");
          toast.success("Download started");
        } catch (error) {
          toast.error("Failed to download file");
        }
        break;

      case "rename":
        window.dispatchEvent(new CustomEvent("open-rename-modal", { detail: { file } }));
        break;

      case "move":
        window.dispatchEvent(new CustomEvent("open-move-modal", { detail: { file } }));
        break;

      case "copy":
        try {
          await fileService.copyFile(file.id);
          toast.success("File copied");
          refreshFiles();
        } catch (error) {
          toast.error("Failed to copy file");
        }
        break;

      case "star":
        try {
          await fileService.toggleStar(file.id);
          toast.success(file.isStarred ? "Removed from starred" : "Added to starred");
          refreshFiles();
        } catch (error) {
          toast.error("Failed to update starred status");
        }
        break;

      case "share":
        window.dispatchEvent(new CustomEvent("open-share-modal", { detail: { file } }));
        break;

      case "trash":
        window.dispatchEvent(new CustomEvent("open-delete-modal", { detail: { file } }));
        break;

      default:
        break;
    }

    onClose();
  };

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 300),
  };

  return (
    <div
      ref={menuRef}
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
            <item.icon className="h-5 w-5 text-neutral-400" />
            {item.label === "Star" && file.isStarred ? "Unstar" : item.label}
          </button>
        )
      )}
    </div>
  );
}

FileContextMenu.propTypes = {
  file: PropTypes.object.isRequired,
  position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
    .isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FileContextMenu;