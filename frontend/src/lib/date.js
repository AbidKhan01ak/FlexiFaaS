// src/utils/date.js
export function formatUploadTime(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    weekday: "long", // e.g. Monday
    year: "numeric", // e.g. 2025
    month: "long", // e.g. August
    day: "numeric", // e.g. 7
    hour: "2-digit", // e.g. 04
    minute: "2-digit", // e.g. 15
    hour12: true, // 12-hour format with AM/PM
  });
}
