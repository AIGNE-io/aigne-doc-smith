/**
 * Simplified Mermaid validation using Worker Thread pool
 * Provides concurrent-safe validation with isolated worker environments
 */

import { getMermaidWorkerPool, shutdownMermaidWorkerPool } from "./mermaid-worker-pool.mjs";

/**
 * Worker-based mermaid validation - DEPRECATED but kept for compatibility
 * This function now delegates to the worker pool implementation
 * @param {string} content - Mermaid diagram content
 * @returns {boolean} - True if syntax is valid
 * @throws {Error} - If syntax is invalid
 * @deprecated Use validateMermaidSyntax instead which uses worker pool
 */
export async function validateMermaidWithOfficialParser(content) {
  // Delegate to the new worker-based implementation
  return await validateMermaidSyntax(content);
}

/**
 * Basic mermaid syntax validation fallback
 * Used when worker validation fails due to environment issues
 * @param {string} content - Mermaid diagram content
 * @returns {boolean} - True if basic validation passes
 * @throws {Error} - If validation fails
 */
export function validateBasicMermaidSyntax(content) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Empty mermaid diagram");
  }

  // Check for valid diagram type
  const validDiagramTypes = [
    "flowchart",
    "graph",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "entityRelationshipDiagram",
    "erDiagram",
    "journey",
    "gantt",
    "pie",
    "requirement",
    "gitgraph",
    "mindmap",
    "timeline",
    "quadrantChart",
  ];

  const firstLine = trimmedContent.split("\n")[0].trim();
  const hasValidType = validDiagramTypes.some((type) => firstLine.includes(type));

  if (!hasValidType) {
    throw new Error("Invalid or missing diagram type");
  }

  // Basic bracket matching
  const openBrackets = (content.match(/[[{(]/g) || []).length;
  const closeBrackets = (content.match(/[\]})]/g) || []).length;

  if (openBrackets !== closeBrackets) {
    throw new Error("Unmatched brackets in diagram");
  }

  // Basic quote matching
  const singleQuotes = (content.match(/'/g) || []).length;
  const doubleQuotes = (content.match(/"/g) || []).length;

  if (singleQuotes % 2 !== 0) {
    throw new Error("Unmatched single quotes in diagram");
  }

  if (doubleQuotes % 2 !== 0) {
    throw new Error("Unmatched double quotes in diagram");
  }

  return true;
}

/**
 * Main validation function using simplified worker pool for concurrency safety
 * @param {string} content - Mermaid diagram content
 * @returns {Promise<boolean>} - True if validation passes
 * @throws {Error} - If validation fails
 */
export async function validateMermaidSyntax(content) {
  if (!content || !content.trim()) {
    throw new Error("Empty mermaid diagram");
  }

  try {
    // Use simplified worker pool for validation
    const workerPool = getMermaidWorkerPool({
      poolSize: 2, // Reduced pool size
      timeout: 10000, // Reduced timeout
    });

    const result = await workerPool.validate(content);
    return result;
  } catch (error) {
    // If worker validation fails, check if it's an environment issue
    const errorMsg = error.message || String(error);

    if (
      errorMsg.includes("Worker error") ||
      errorMsg.includes("Worker exited") ||
      errorMsg.includes("Worker pool") ||
      errorMsg.includes("timeout") ||
      errorMsg.includes("Cannot resolve module") ||
      errorMsg.includes("window is not defined") ||
      errorMsg.includes("canvas") ||
      errorMsg.includes("Web APIs") ||
      errorMsg.includes("getComputedTextLength") ||
      errorMsg.includes("document is not defined")
    ) {
      // Fall back to basic validation for environment issues
      console.warn(
        "Worker-based mermaid validation failed, falling back to basic validation:",
        errorMsg,
      );
      return validateBasicMermaidSyntax(content);
    }

    // If it's a genuine syntax error, re-throw it
    throw error;
  }
}

/**
 * Get worker pool statistics for monitoring
 * @returns {Object} - Pool statistics
 */
export function getValidationStats() {
  try {
    const workerPool = getMermaidWorkerPool();
    return workerPool.getStats();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Shutdown the validation worker pool
 * Call this when shutting down the application
 * @returns {Promise<void>}
 */
export async function shutdownValidation() {
  await shutdownMermaidWorkerPool();
}
