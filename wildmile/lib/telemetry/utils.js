import crypto from "crypto";

/**
 * Hashes a user ID using SHA256 and a salt.
 * @param {string} userId - The raw user ID.
 * @returns {string} - The hashed user ID.
 */
export function hashUserId(userId) {
  if (!userId) return null;
  const salt = process.env.TELEMETRY_SALT || "default_salt_change_me";
  return crypto
    .createHash("sha256")
    .update(userId + salt)
    .digest("hex");
}

/**
 * Calculates Central Time from a UTC date.
 * @param {Date} date - The UTC date.
 * @returns {string} - The formatted Central Time string.
 */
export function getCentralTime(date) {
  return date.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "full",
    timeStyle: "long",
  });
}
