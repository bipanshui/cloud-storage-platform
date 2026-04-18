import PropTypes from "prop-types";
import clsx from "clsx";
import {
  HiDocument,
  HiPhoto,
  HiFilm,
  HiMusicalNote,
  HiFolder,
} from "react-icons/hi2";
import {
  FaFileWord,
  FaFileExcel,
  FaFilePdf,
  FaFileArchive,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
} from "react-icons/fa";

const iconMap = {
  "application/pdf": FaFilePdf,
  "image/jpeg": FaFileImage,
  "image/png": FaFileImage,
  "image/gif": FaFileImage,
  "image/webp": FaFileImage,
  "video/mp4": FaFileVideo,
  "video/webm": FaFileVideo,
  "audio/mpeg": FaFileAudio,
  "audio/wav": FaFileAudio,
  "application/zip": FaFileArchive,
  "application/x-zip-compressed": FaFileArchive,
  "application/msword": FaFileWord,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FaFileWord,
  "application/vnd.ms-excel": FaFileExcel,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FaFileExcel,
  folder: HiFolder,
};

const colorMap = {
  "application/pdf": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "image/jpeg": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "image/png": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "image/gif": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "image/webp": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "video/mp4": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "video/webm": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "audio/mpeg": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "audio/wav": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "application/zip": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "application/x-zip-compressed": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "application/msword": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "application/vnd.ms-excel": { bg: "bg-neutral-100", color: "text-neutral-600" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { bg: "bg-neutral-100", color: "text-neutral-600" },
  folder: { bg: "bg-neutral-100", color: "text-neutral-600" },
  default: { bg: "bg-neutral-100", color: "text-neutral-600" },
};

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 64,
  xl: 96,
};

function FileIcon({ mimeType, size = "md", isFolder = false }) {
  const iconSize = sizeMap[size] || sizeMap.md;

  const getMimeCategory = (type) => {
    if (type?.startsWith("image/")) return "image/jpeg";
    if (type?.startsWith("video/")) return "video/mp4";
    if (type?.startsWith("audio/")) return "audio/mpeg";
    if (type?.startsWith("application/pdf")) return "application/pdf";
    if (type?.includes("word") || type?.includes("document")) return "application/msword";
    if (type?.includes("excel") || type?.includes("spreadsheet")) return "application/vnd.ms-excel";
    if (type?.includes("zip") || type?.includes("archive")) return "application/zip";
    return type || "default";
  };

  const mimeCategory = isFolder ? "folder" : getMimeCategory(mimeType);
  const IconComponent = iconMap[mimeCategory] || HiDocument;
  const colors = colorMap[mimeCategory] || colorMap.default;

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-lg",
        colors.bg,
        colors.color
      )}
      style={{ width: iconSize, height: iconSize }}
    >
      <IconComponent className="shrink-0" style={{ width: iconSize * 0.5, height: iconSize * 0.5 }} />
    </div>
  );
}

FileIcon.propTypes = {
  mimeType: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  isFolder: PropTypes.bool,
};

export default FileIcon;