import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useFile } from "@/hooks/useFile";
import { formatBytes } from "@/utils/helpers";
import { HiXMark, HiChevronUp, HiChevronDown, HiCheckCircle, HiExclamationCircle } from "react-icons/hi2";

function UploadProgress() {
  const { uploadQueue, removeFromUploadQueue } = useFile();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = uploadQueue.filter((item) => item.status === "complete").length;
  const totalCount = uploadQueue.length;
  const hasCompleted = completedCount > 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  useEffect(() => {
    if (allCompleted) {
      const timer = setTimeout(() => {
        uploadQueue.forEach((item) => {
          if (item.status === "complete") {
            removeFromUploadQueue(item.id);
          }
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [allCompleted, uploadQueue, removeFromUploadQueue]);

  if (uploadQueue.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-40 w-80 rounded-lg border border-neutral-200 bg-white shadow-flat transition-all duration-300",
        isMinimized && "h-14"
      )}
    >
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-900">
            {completedCount} of {totalCount} uploaded
          </span>
          {allCompleted && (
            <HiCheckCircle className="h-5 w-5 text-neutral-600" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-100"
          >
            {isMinimized ? (
              <HiChevronUp className="h-5 w-5" />
            ) : (
              <HiChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {!isMinimized && isExpanded && (
        <div className="max-h-80 overflow-y-auto px-4 pb-4">
          <div className="space-y-3">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3"
              >
                <div className="mt-1 flex-shrink-0">
                  {item.status === "complete" ? (
                    <HiCheckCircle className="h-5 w-5 text-neutral-600" />
                  ) : item.status === "error" ? (
                    <HiExclamationCircle className="h-5 w-5 text-neutral-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatBytes(item.size)}
                  </p>
                  {item.status === "uploading" && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-neutral-900 transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.status === "error" && (
                    <p className="mt-1 text-xs text-neutral-500">{item.error}</p>
                  )}
                </div>
                <button
                  onClick={() => removeFromUploadQueue(item.id)}
                  className="flex-shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
                >
                  <HiXMark className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadProgress;