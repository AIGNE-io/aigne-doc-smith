/**
 * AFS Image Slot 相关的工具函数
 * 用于解析和处理文档中的图片 slot
 */

/**
 * Slot 正则表达式（用于替换操作）
 * 支持以下格式：
 * - <!-- afs:image id="..." key="..." desc="..." -->
 * - <!-- afs:image id="..." desc="..." -->
 * - <!-- afs:image id=\"...\" key=\"...\" desc=\"...\" -->
 * - <!-- afs:image id=\"...\" desc=\"...\" -->
 */
export const SLOT_REGEX =
  /<!--\s*afs:image\s+id=\\?"([^\\"]+)\\?"(?:\s+key=\\?"([^\\"]+)\\?")?\s+desc=\\?"([^\\"]+)\\?"\s*-->/g;

/**
 * 生成 key（如果 slot 未提供）
 * @param {string} docPath - 文档路径（如 "/overview"）
 * @param {string} id - slot id
 * @returns {string} - 生成的 key
 */
export function generateKey(docPath, id) {
  // 去掉开头的 /
  const normalizedPath = docPath.startsWith("/") ? docPath.slice(1) : docPath;
  // 将 / 替换为 -
  const pathPart = normalizedPath.replace(/\//g, "-");
  return `${pathPart}-${id}`;
}

/**
 * 解析文档中的 AFS image slots
 * @param {string} content - 文档内容
 * @param {string} docPath - 文档路径（用于生成 key）
 * @returns {Array<{id: string, key: string, desc: string, raw: string}>} - Slot 数组
 */
export function parseSlots(content, docPath) {
  // Slot 格式：<!-- afs:image id="..." key="..." desc="..." -->
  // key 是可选的
  const slotRegex = SLOT_REGEX;

  const slots = [];

  for (const match of content.matchAll(slotRegex)) {
    const id = match[1];
    const userKey = match[2]; // 可能是 undefined
    const desc = match[3];
    const raw = match[0]; // 完整的 slot 字符串

    // 如果用户没提供 key，自动生成
    const key = userKey || generateKey(docPath, id);

    slots.push({ id, key, desc, raw });
  }

  return slots;
}
