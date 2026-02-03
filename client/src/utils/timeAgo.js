/**
 * Returns a human-readable relative time string, e.g. "3h ago", "2 days ago".
 * Falls back to a short locale date string for anything older than 30 days.
 */
export function timeAgo(dateInput) {
  const seconds = Math.floor((Date.now() - new Date(dateInput)) / 1000);
  if (seconds < 60)  return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60)     return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24)    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)     return `${days}d ago`;
  return new Date(dateInput).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Formats a date as YYYY-MM-DD for <input type="date"> value.
 */
export function toDateInputValue(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  return d.toISOString().slice(0, 10);
}
