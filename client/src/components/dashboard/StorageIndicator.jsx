import PropTypes from "prop-types";
import clsx from "clsx";
import { formatBytes } from "@/utils/helpers";

function StorageIndicator({ storageInfo, className }) {
  const percentage = storageInfo?.percentage || 0;
  const used = storageInfo?.used || 0;
  const limit = storageInfo?.limit || 0;

  const getColorClass = () => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={clsx("rounded-lg border border-neutral-200 bg-neutral-50 p-4", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-900">Storage</span>
        <span className={clsx(
          "font-medium",
          percentage >= 80 ? "text-red-600" : "text-neutral-500"
        )}>
          {percentage}%
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-neutral-200">
        <div
          className={clsx("h-2 rounded-full", getColorClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        {formatBytes(used)} of {formatBytes(limit)} used
      </p>
    </div>
  );
}

StorageIndicator.propTypes = {
  storageInfo: PropTypes.shape({
    used: PropTypes.number,
    limit: PropTypes.number,
    percentage: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default StorageIndicator;