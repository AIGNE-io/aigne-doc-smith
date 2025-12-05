import path from "node:path";

import fs from "fs-extra";

import { DOC_SMITH_DIR, TMP_DIR } from "./constants/index.mjs";

// Note: .* matches title or other text after ```d2 (e.g., ```d2 Vault 驗證流程)
// Export regex for reuse across the codebase to avoid duplication
export const d2CodeBlockRegex = /```d2.*\n([\s\S]*?)```/g;

// Keep codeBlockRegex for backward compatibility (used internally in this file)
const codeBlockRegex = d2CodeBlockRegex;

export const DIAGRAM_PLACEHOLDER = "DIAGRAM_PLACEHOLDER";

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
  const matches = Array.from(content.matchAll(codeBlockRegex));
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
  const [firstMatch] = Array.from(content.matchAll(codeBlockRegex));
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
