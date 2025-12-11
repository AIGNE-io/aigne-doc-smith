import path from "node:path";

import fs from "fs-extra";

import { DOC_SMITH_DIR, TMP_DIR } from "./constants/index.mjs";

// Note: .* matches title or other text after ```d2 (e.g., ```d2 Vault 驗證流程)
// Export regex for reuse across the codebase to avoid duplication
export const d2CodeBlockRegex = /```d2.*\n([\s\S]*?)```/g;

export const DIAGRAM_PLACEHOLDER = "DIAGRAM_PLACEHOLDER";

// Diagram image regex patterns for reuse across the codebase
// Pattern 1: Match only the start marker (for checking existence)
export const diagramImageStartRegex =
  /<!--\s*DIAGRAM_IMAGE_START:([A-Za-z0-9_-]+):(\d+:\d+)(:\d+)?\s*-->/g;

// Pattern 2: Match full diagram image block without capturing image path (for finding/replacing)
// Supports both old format (without aspectRatio) and new format (with aspectRatio)
export const diagramImageBlockRegex =
  /<!--\s*DIAGRAM_IMAGE_START:([A-Za-z0-9_-]+)(?::(\d+:\d+))?(:\d+)?\s*-->\s*[\s\S]*?<!--\s*DIAGRAM_IMAGE_END\s*-->/g;

// Pattern 3: Match full diagram image block with image path capture (for extracting paths)
// Compatible with old format (without timestamp): <!-- DIAGRAM_IMAGE_START:type:aspectRatio -->
export const diagramImageWithPathRegex =
  /<!--\s*DIAGRAM_IMAGE_START:([A-Za-z0-9_-]+):(\d+:\d+)(:\d+)?\s*-->\s*!\[[^\]]*\]\(([^)]+)\)\s*<!--\s*DIAGRAM_IMAGE_END\s*-->/g;

// Pattern 4: Match full diagram image block with all details (type, aspectRatio, timestamp, path, altText)
export const diagramImageFullRegex =
  /<!--\s*DIAGRAM_IMAGE_START:([A-Za-z0-9_-]+):(\d+:\d+)(:\d+)?\s*-->\s*!\[([^\]]*)\]\(([^)]+)\)\s*<!--\s*DIAGRAM_IMAGE_END\s*-->/g;

export async function ensureTmpDir() {
  const tmpDir = path.join(DOC_SMITH_DIR, TMP_DIR);
  if (!(await fs.pathExists(path.join(tmpDir, ".gitignore")))) {
    await fs.ensureDir(tmpDir);
    await fs.writeFile(path.join(tmpDir, ".gitignore"), "**/*", { encoding: "utf8" });
  }
}

export function isValidCode(lang) {
  return lang?.toLowerCase() === "d2";
}

export function wrapCode({ content }) {
  const matches = Array.from(content.matchAll(d2CodeBlockRegex));
  if (matches.length > 0) {
    return content;
  }

  return `\`\`\`d2\n${content}\n\`\`\``;
}

/**
 * Replaces D2 code block with DIAGRAM_PLACEHOLDER.
 * @param {string} content - Document content containing D2 code block
 * @returns {Array} - [contentWithPlaceholder, originalCodeBlock]
 */
export function replaceD2WithPlaceholder({ content }) {
  const [firstMatch] = Array.from(content.matchAll(d2CodeBlockRegex));
  if (firstMatch) {
    const matchContent = firstMatch[0];
    const cleanContent = content.replace(matchContent, DIAGRAM_PLACEHOLDER);
    return [cleanContent, matchContent];
  }

  return [content, ""];
}

/**
 * Replaces DIAGRAM_PLACEHOLDER with D2 code block, ensuring proper spacing.
 * @param {string} content - Document content containing DIAGRAM_PLACEHOLDER
 * @param {string} diagramSourceCode - D2 diagram source code (without markdown wrapper)
 * @returns {string} - Content with placeholder replaced by code block
 */
export function replacePlaceholderWithD2({ content, diagramSourceCode }) {
  if (!content || !diagramSourceCode) {
    return content;
  }

  const placeholderIndex = content.indexOf(DIAGRAM_PLACEHOLDER);
  if (placeholderIndex === -1) {
    return content;
  }

  // Check if placeholder has newlines around it
  const beforePlaceholder = content.substring(0, placeholderIndex);
  const afterPlaceholder = content.substring(placeholderIndex + DIAGRAM_PLACEHOLDER.length);

  const codeBlock = wrapCode({ content: diagramSourceCode });

  // Add newlines if missing
  let replacement = codeBlock;
  if (beforePlaceholder && !beforePlaceholder.endsWith("\n")) {
    replacement = `\n${replacement}`;
  }
  if (afterPlaceholder && !afterPlaceholder.startsWith("\n")) {
    replacement = `${replacement}\n`;
  }

  return content.replace(DIAGRAM_PLACEHOLDER, replacement);
}

/**
 * Replace all diagrams (D2 code blocks and generated images) with DIAGRAM_PLACEHOLDER
 * Used for deletion operations to normalize all diagram types to a single placeholder
 * @param {string} content - Document content containing diagrams
 * @param {number} [diagramIndex] - Optional index of diagram to replace (0-based). If not provided, replaces all diagrams.
 * @returns {string} - Content with diagrams replaced by DIAGRAM_PLACEHOLDER
 */
export function replaceDiagramsWithPlaceholder({ content, diagramIndex }) {
  if (!content) {
    return content;
  }

  // Use exported regex to find all diagram locations
  // We'll use a similar approach to findAllDiagramLocations
  const mermaidCodeBlockRegex = /```mermaid.*\n([\s\S]*?)```/g;

  // Find all diagram locations
  const locations = [];

  // 1. Find DIAGRAM_PLACEHOLDER (already a placeholder, keep as is)
  let placeholderIndex = content.indexOf(DIAGRAM_PLACEHOLDER);
  while (placeholderIndex !== -1) {
    locations.push({
      type: "placeholder",
      start: placeholderIndex,
      end: placeholderIndex + DIAGRAM_PLACEHOLDER.length,
    });
    placeholderIndex = content.indexOf(DIAGRAM_PLACEHOLDER, placeholderIndex + 1);
  }

  // 2. Find DIAGRAM_IMAGE_START markers (generated images)
  const imageMatches = Array.from(content.matchAll(diagramImageBlockRegex));
  for (const match of imageMatches) {
    locations.push({
      type: "image",
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // 3. Find D2 code blocks
  const d2Matches = Array.from(content.matchAll(d2CodeBlockRegex));
  for (const match of d2Matches) {
    locations.push({
      type: "d2",
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // 4. Find Mermaid code blocks
  const mermaidMatches = Array.from(content.matchAll(mermaidCodeBlockRegex));
  for (const match of mermaidMatches) {
    locations.push({
      type: "mermaid",
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // Sort by position (top to bottom)
  locations.sort((a, b) => a.start - b.start);

  if (locations.length === 0) {
    return content;
  }

  // If diagramIndex is provided, only replace that specific diagram
  if (diagramIndex !== undefined && diagramIndex >= 0 && diagramIndex < locations.length) {
    const targetLocation = locations[diagramIndex];
    const before = content.substring(0, targetLocation.start);
    const after = content.substring(targetLocation.end);
    // Add newlines if needed
    let replacement = DIAGRAM_PLACEHOLDER;
    if (before && !before.endsWith("\n")) {
      replacement = `\n${replacement}`;
    }
    if (after && !after.startsWith("\n")) {
      replacement = `${replacement}\n`;
    }
    return before + replacement + after;
  }

  // Replace all diagrams with placeholder (for deletion)
  // Process from end to start to preserve indices
  let result = content;
  for (let i = locations.length - 1; i >= 0; i--) {
    const location = locations[i];
    const before = result.substring(0, location.start);
    const after = result.substring(location.end);
    // Add newlines if needed
    let replacement = DIAGRAM_PLACEHOLDER;
    if (before && !before.endsWith("\n")) {
      replacement = `\n${replacement}`;
    }
    if (after && !after.startsWith("\n")) {
      replacement = `${replacement}\n`;
    }
    result = before + replacement + after;
  }

  return result;
}
