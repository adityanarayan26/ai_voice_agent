/**
 * Format a date to "12 Jan 2026" style
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/**
 * Format a date to "12 Jan 2026, 2:30 PM" style
 */
export function formatDateTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const dateStr = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
}

/**
 * Format a time to "2:30 PM" style
 */
export function formatTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}
