/**
 * Returns a user-facing error message from an API error object.
 * @param {unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

/**
 * Formats bytes into a readable storage string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes = 0) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  const precision = value >= 10 ? 0 : 1;

  return `${value.toFixed(precision)} ${units[exponent]}`;
}

/**
 * Calculates the storage percentage for a user profile.
 * @param {{ storageUsed?: number, storageLimit?: number }} user
 * @returns {number}
 */
export function getStorageUsagePercentage(user = {}) {
  const used = user.storageUsed || 0;
  const limit = user.storageLimit || 1;
  return Math.min(100, Math.round((used / limit) * 100));
}

/**
 * Derives initials from a user profile.
 * @param {{ firstName?: string, lastName?: string }} user
 * @returns {string}
 */
export function getUserInitials(user = {}) {
  return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
}

/**
 * Maps a percentage to a Tailwind width class.
 * @param {number} value
 * @returns {string}
 */
export function getProgressWidthClass(value = 0) {
  if (value <= 0) return "w-0";
  if (value <= 10) return "w-[10%]";
  if (value <= 20) return "w-[20%]";
  if (value <= 30) return "w-[30%]";
  if (value <= 40) return "w-[40%]";
  if (value <= 50) return "w-1/2";
  if (value <= 60) return "w-[60%]";
  if (value <= 70) return "w-[70%]";
  if (value <= 80) return "w-[80%]";
  if (value <= 90) return "w-[90%]";
  return "w-full";
}
