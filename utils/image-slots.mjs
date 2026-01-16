/**
 * AFS Image Slot utility functions
 * For parsing and processing image slots in documents
 */

/**
 * Slot regex (for replacement operations)
 * Supports the following formats:
 * - <!-- afs:image id="..." key="..." desc="..." -->
 * - <!-- afs:image id="..." desc="..." -->
 * - <!-- afs:image id=\"...\" key=\"...\" desc=\"...\" -->
 * - <!-- afs:image id=\"...\" desc=\"...\" -->
 */
export const SLOT_REGEX =
  /<!--\s*afs:image\s+id=\\?"([^\\"]+)\\?"(?:\s+key=\\?"([^\\"]+)\\?")?\s+desc=\\?"([^\\"]+)\\?"\s*-->/g;

/**
 * Generate key (if slot doesn't provide one)
 * @param {string} docPath - Document path (e.g., "/overview")
 * @param {string} id - slot id
 * @returns {string} - Generated key
 */
export function generateKey(docPath, id) {
  // Remove leading /
  const normalizedPath = docPath.startsWith("/") ? docPath.slice(1) : docPath;
  // Replace / with -
  const pathPart = normalizedPath.replace(/\//g, "-");
  return `${pathPart}-${id}`;
}

/**
 * Parse AFS image slots from document
 * @param {string} content - Document content
 * @param {string} docPath - Document path (used for generating key)
 * @returns {Array<{id: string, key: string, desc: string, raw: string}>} - Slot array
 */
export function parseSlots(content, docPath) {
  // Slot format: <!-- afs:image id="..." key="..." desc="..." -->
  // key is optional
  const slotRegex = SLOT_REGEX;

  const slots = [];

  for (const match of content.matchAll(slotRegex)) {
    const id = match[1];
    const userKey = match[2]; // May be undefined
    const desc = match[3];
    const raw = match[0]; // Complete slot string

    // Auto-generate key if user didn't provide one
    const key = userKey || generateKey(docPath, id);

    slots.push({ id, key, desc, raw });
  }

  return slots;
}
