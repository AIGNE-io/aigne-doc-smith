#!/usr/bin/env node

/**
 * Simplified Mermaid Validation Worker
 * Runs in isolated Worker thread to avoid global state conflicts
 */

import { parentPort } from "node:worker_threads";

/**
 * Validate mermaid syntax using official parser in isolated environment
 */
async function validateMermaidWithOfficialParser(content) {
  const trimmedContent = content.trim();
  if (!content || !trimmedContent) {
    throw new Error("Empty mermaid diagram");
  }

  try {
    // Import dependencies
    const { JSDOM } = await import("jsdom");
    const DOMPurifyModule = await import("dompurify");

    // Create isolated DOM environment
    const { window } = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
      pretendToBeVisual: true,
      resources: "usable",
    });

    // Setup globals (safe in worker - no conflicts)
    global.window = window;
    global.document = window.document;

    // Only set navigator if it doesn't exist
    if (!global.navigator) {
      global.navigator = {
        userAgent: "node.js",
        platform: "node",
        cookieEnabled: false,
        onLine: true,
      };
    }

    global.DOMParser = window.DOMParser;
    global.XMLSerializer = window.XMLSerializer;
    global.HTMLElement = window.HTMLElement;
    global.HTMLDivElement = window.HTMLDivElement;
    global.SVGElement = window.SVGElement;
    global.Element = window.Element;
    global.Node = window.Node;

    // Initialize DOMPurify with the JSDOM window
    const dompurify = DOMPurifyModule.default(window);

    // Verify DOMPurify is working before proceeding
    if (typeof dompurify.sanitize !== "function") {
      throw new Error("DOMPurify initialization failed - sanitize method not available");
    }

    // Test DOMPurify functionality
    dompurify.sanitize("<p>test</p>");

    // Step 5: Comprehensively set up DOMPurify in all possible global locations
    global.DOMPurify = dompurify;
    window.DOMPurify = dompurify;

    // For ES module interception, we need to ensure DOMPurify is available
    // in all the ways mermaid might try to access it
    if (typeof globalThis !== "undefined") {
      globalThis.DOMPurify = dompurify;
    }

    // Set up on the global scope itself
    if (typeof self !== "undefined") {
      self.DOMPurify = dompurify;
    }

    // CRITICAL: Override the DOMPurify constructor/factory to always use our window
    // This is the key to solving the issue: mermaid imports DOMPurify directly
    const originalDOMPurifyFactory = DOMPurifyModule.default;
    try {
      // This might work: intercept the factory function itself
      if (typeof originalDOMPurifyFactory === "function" && !originalDOMPurifyFactory.sanitize) {
        // This means DOMPurify.default is a factory function, not an instance
        // We need to make sure when mermaid calls DOMPurify.sanitize, it works
        const factoryResult = originalDOMPurifyFactory(window);

        // Copy methods from our working instance to the factory result
        Object.assign(originalDOMPurifyFactory, factoryResult);
      }
    } catch (_factoryError) {
      // If factory modification fails, that's OK - we have other fallbacks
    }

    // Import and setup mermaid
    const mermaid = await import("mermaid");

    mermaid.default.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      htmlLabels: false,
    });

    // Parse content
    await mermaid.default.parse(trimmedContent);

    return true;
  } catch (error) {
    const errorMessage = error.message || String(error);

    // Keep parse errors as-is for useful info
    if (errorMessage.includes("Parse error")) {
      throw new Error(errorMessage);
    }

    if (errorMessage.includes("Expecting ")) {
      throw new Error(`Syntax error: ${errorMessage.replace(/^.*Expecting /, "Expected ")}`);
    }

    if (errorMessage.includes("Lexical error")) {
      throw new Error("Syntax error: invalid characters or tokens");
    }

    if (errorMessage.includes("No diagram type detected")) {
      throw new Error("Syntax error: invalid or unrecognized diagram type");
    }

    throw new Error(errorMessage);
  }
}

/**
 * Basic validation fallback
 */
function validateBasicMermaidSyntax(content) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Empty mermaid diagram");
  }

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

  return true;
}

/**
 * Main validation with fallback
 */
async function validateMermaidSyntax(content) {
  try {
    return await validateMermaidWithOfficialParser(content);
  } catch (officialError) {
    const errorMsg = officialError.message || String(officialError);

    // Check if it's an environment issue
    if (
      errorMsg.includes("Cannot resolve module") ||
      errorMsg.includes("window is not defined") ||
      errorMsg.includes("canvas") ||
      errorMsg.includes("Web APIs") ||
      errorMsg.includes("getComputedTextLength") ||
      errorMsg.includes("document is not defined") ||
      errorMsg.includes("DOMPurify")
    ) {
      // Fall back to basic validation
      return validateBasicMermaidSyntax(content);
    }

    // Re-throw syntax errors
    throw officialError;
  }
}

// Worker message handler
if (parentPort) {
  parentPort.on("message", async (data) => {
    const { id, content } = data;

    try {
      if (!id || !content) {
        throw new Error("Missing id or content");
      }

      const result = await validateMermaidSyntax(content);

      parentPort.postMessage({
        id,
        success: true,
        result,
      });
    } catch (error) {
      parentPort.postMessage({
        id,
        error: error.message || String(error),
      });
    }
  });
}

export { validateMermaidSyntax };
