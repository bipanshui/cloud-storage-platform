import { asyncHandler, formatBytes } from "../utils/helpers.js";

/**
 * Returns the authenticated user's storage summary.
 */
export const getStorageInfo = asyncHandler(async (req, res) => {
  const percentage = req.user.storageLimit
    ? Math.min(100, Math.round((req.user.storageUsed / req.user.storageLimit) * 100))
    : 0;

  res.status(200).json({
    success: true,
    data: {
      storageUsed: req.user.storageUsed,
      storageLimit: req.user.storageLimit,
      storageUsedFormatted: formatBytes(req.user.storageUsed),
      storageLimitFormatted: formatBytes(req.user.storageLimit),
      percentage,
    },
  });
});
