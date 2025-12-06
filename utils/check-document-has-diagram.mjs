import { DIAGRAM_PLACEHOLDER, d2CodeBlockRegex, diagramImageStartRegex } from "./d2-utils.mjs";

/**
 * Check if document content contains diagram-related content
 * @param {string} content - Document content to check
 * @returns {boolean} - True if document contains d2 code blocks, DIAGRAM_PLACEHOLDER, or diagram images
 */
export function hasDiagramContent(content) {
  if (!content || typeof content !== "string") {
    return false;
  }

  // Check for DIAGRAM_PLACEHOLDER
  if (content.includes(DIAGRAM_PLACEHOLDER)) {
    return true;
  }

  // Check for D2 code blocks
  const d2Matches = Array.from(content.matchAll(d2CodeBlockRegex));
  if (d2Matches.length > 0) {
    return true;
  }

  // Check for existing diagram images (DIAGRAM_IMAGE_START markers)
  const imageMatches = Array.from(content.matchAll(diagramImageStartRegex));
  if (imageMatches.length > 0) {
    return true;
  }

  return false;
}

/**
 * Get diagram type labels for a document
 * @param {string} content - Document content to analyze
 * @returns {string[]} - Array of diagram type labels (e.g., ["D2", "AI Image", "Placeholder"])
 */
export function getDiagramTypeLabels(content) {
  if (!content || typeof content !== "string") {
    return [];
  }

  const labels = [];

  // Check for D2 code blocks
  const d2Matches = Array.from(content.matchAll(d2CodeBlockRegex));
  if (d2Matches.length > 0) {
    labels.push("⛔️ D2");
  }

  // Check for existing diagram images (AI-generated images)
  const imageMatches = Array.from(content.matchAll(diagramImageStartRegex));
  if (imageMatches.length > 0) {
    labels.push("🍌 Image");
  }

  // Check for DIAGRAM_PLACEHOLDER
  if (content.includes(DIAGRAM_PLACEHOLDER)) {
    labels.push("Placeholder");
  }

  return labels;
}

/**
 * Format diagram type labels as a suffix string
 * @param {string[]} labels - Array of diagram type labels
 * @returns {string} - Formatted suffix string (e.g., " [D2, AI Image]")
 */
export function formatDiagramTypeSuffix(labels) {
  if (!labels || labels.length === 0) {
    return "";
  }
  return ` [${labels.join(", ")}]`;
}

/**
 * Check if document content contains banana images (AI-generated images)
 * Only checks for DIAGRAM_IMAGE_START markers, excludes D2 code blocks and placeholders
 * @param {string} content - Document content to check
 * @returns {boolean} - True if document contains banana images
 */
export function hasBananaImages(content) {
  if (!content || typeof content !== "string") {
    return false;
  }

  // Check for existing diagram images (DIAGRAM_IMAGE_START markers)
  const imageMatches = Array.from(content.matchAll(diagramImageStartRegex));
  if (imageMatches.length > 0) {
    return true;
  }

  return false;
}
