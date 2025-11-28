import { createHash } from "node:crypto";
import chalk from "chalk";
import { getHistory } from "../../utils/history-utils.mjs";

export default function viewHistory() {
  const history = getHistory();

  if (!history.entries || history.entries.length === 0) {
    console.log(chalk.yellow("\nNo update history found\n"));
    return {};
  }

  console.log(chalk.cyan("\n📜 Update History\n"));

  history.entries.forEach((entry) => {
    // Format: <short-hash> <date> <operation> <feedback>
    const hash = generateShortHash(entry.timestamp);
    const date = formatRelativeDate(entry.timestamp);
    const operation = entry.operation;

    // Handle document path (now a string)
    const documentInfo = entry.documentPath ? chalk.dim(` (${entry.documentPath})`) : "";

    // Git-style oneline format
    console.log(
      `${chalk.yellow(hash)} ${chalk.dim(date)} ${chalk.cyan(operation)}${documentInfo}: ${entry.feedback}`,
    );
  });

  console.log(); // Empty line at end

  return {};
}

/**
 * Generate a short hash from timestamp (git-style)
 */
function generateShortHash(timestamp) {
  // Create a deterministic hash from timestamp only
  // This ensures the same timestamp always produces the same hash
  const hash = createHash("sha1").update(timestamp).digest("hex");
  return hash.substring(0, 8); // First 8 chars of SHA1 hash
}

/**
 * Format date in relative time (git-style)
 */
function formatRelativeDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return `${diffSecs} seconds ago`;
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  // Show actual date for older entries
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

viewHistory.description = "View update history in compact format";
viewHistory.taskTitle = "View update history";
