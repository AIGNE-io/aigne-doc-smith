/**
 * Enhanced Mermaid validation using official mermaid library with proper DOM setup
 * This provides accurate syntax validation by setting up a minimal browser environment
 * @param {string} content - Mermaid diagram content
 * @returns {Promise<boolean>} - True if valid, throws error if invalid
 */
export async function validateMermaidWithOfficialParser(content) {
  const trimmedContent = content.trim();

  if (!content || !trimmedContent) {
    throw new Error("Empty mermaid diagram");
  }

  // Store original globals and module state
  const originalGlobals = {
    window: global.window,
    document: global.document,
    navigator: global.navigator,
    DOMParser: global.DOMParser,
    XMLSerializer: global.XMLSerializer,
    HTMLElement: global.HTMLElement,
    HTMLDivElement: global.HTMLDivElement,
    SVGElement: global.SVGElement,
    Element: global.Element,
    Node: global.Node,
    DOMPurify: global.DOMPurify,
  };

  let DOMPurifyModule = null;
  let originalDOMPurifyDefault = null;

  try {
    // Step 1: Import JSDOM and DOMPurify
    const { JSDOM } = await import("jsdom");
    DOMPurifyModule = await import("dompurify");
    originalDOMPurifyDefault = DOMPurifyModule.default;

    // Step 2: Create DOM environment
    const { window } = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
      pretendToBeVisual: true,
      resources: "usable",
    });

    // Step 3: Set up global DOM environment
    global.window = window;
    global.document = window.document;

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

    // Step 4: Initialize DOMPurify with the JSDOM window
    const dompurify = DOMPurifyModule.default(window);

    // Verify DOMPurify works
    if (typeof dompurify.sanitize !== "function") {
      throw new Error(
        "DOMPurify initialization failed - sanitize method not available"
      );
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

    // And crucially, we need to override the imported DOMPurify somehow
    // Let's try a different approach: modify DOMPurify's prototype or key methods
    // Since mermaid imports DOMPurify and calls methods on it, we need to ensure
    // that the imported module works in our Node.js environment

    // The key insight: mermaid's DOMPurify import will get a default function
    // that hasn't been initialized with a window object. We need to make sure
    // that even the original DOMPurify module works by providing a fallback window.

    // Override the DOMPurify constructor/factory to always use our window
    const originalDOMPurifyFactory = DOMPurifyModule.default;
    try {
      // This might work: intercept the factory function itself
      if (
        typeof originalDOMPurifyFactory === "function" &&
        !originalDOMPurifyFactory.sanitize
      ) {
        // This means DOMPurify.default is a factory function, not an instance
        // We need to make sure when mermaid calls DOMPurify.sanitize, it works
        const factoryResult = originalDOMPurifyFactory(window);

        // Copy methods from our working instance to the factory result
        Object.assign(originalDOMPurifyFactory, factoryResult);
      }
    } catch (factoryError) {
      // If factory modification fails, that's OK - we have other fallbacks
    }

    // Step 6: Now import mermaid - it should get our configured DOMPurify
    const mermaid = await import("mermaid");

    // Step 7: Initialize mermaid with basic config
    mermaid.default.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      htmlLabels: false,
    });

    // Step 8: Parse content (should now work without DOMPurify errors)
    await mermaid.default.parse(trimmedContent);

    return true;
  } catch (error) {
    // Clean up error messages for better user experience
    let errorMessage = error.message || String(error);

    // Handle common mermaid error patterns
    if (errorMessage.includes("Parse error")) {
      // Keep the original parse error since it contains useful line information
      throw new Error(errorMessage);
    }

    if (errorMessage.includes("Expecting ")) {
      errorMessage =
        "Syntax error: " + errorMessage.replace(/^.*Expecting /, "Expected ");
    }

    if (errorMessage.includes("Lexical error")) {
      errorMessage = "Syntax error: invalid characters or tokens";
    }

    if (errorMessage.includes("No diagram type detected")) {
      errorMessage = "Unknown or unsupported diagram type";
    }

    if (errorMessage.includes("Unrecognized text")) {
      errorMessage =
        "Syntax error: unrecognized text or invalid diagram structure";
    }

    throw new Error(errorMessage);
  } finally {
    // Clean up and restore globals and modules
    try {
      // Restore DOMPurify module first
      if (DOMPurifyModule && originalDOMPurifyDefault) {
        DOMPurifyModule.default = originalDOMPurifyDefault;
      }

      // Restore global variables
      Object.keys(originalGlobals).forEach((key) => {
        if (originalGlobals[key] !== undefined) {
          global[key] = originalGlobals[key];
        } else {
          delete global[key];
        }
      });
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Basic mermaid syntax validation fallback
 * Used when JSDOM validation fails due to environment issues
 * @param {string} content - Mermaid diagram content
 * @returns {boolean} - True if basic validation passes
 */
export function validateBasicMermaidSyntax(content) {
  const lines = content.trim().split("\n");
  const firstLine = lines[0].trim();

  // Known mermaid diagram types with more comprehensive patterns
  const diagramTypePatterns = [
    /^graph\s+(TD|TB|BT|RL|LR)/i,
    /^flowchart\s+(TD|TB|BT|RL|LR)/i,
    /^sequenceDiagram/i,
    /^classDiagram/i,
    /^stateDiagram/i,
    /^stateDiagram-v2/i,
    /^erDiagram/i,
    /^journey/i,
    /^gantt/i,
    /^pie/i,
    /^gitgraph/i,
    /^mindmap/i,
    /^timeline/i,
    /^sankey-beta/i,
    /^requirementDiagram/i,
    /^C4Context/i,
    /^C4Container/i,
    /^C4Component/i,
    /^C4Dynamic/i,
    /^C4Deployment/i,
  ];

  // Check if first line matches any known diagram type
  const isKnownType = diagramTypePatterns.some((pattern) =>
    pattern.test(firstLine)
  );

  if (!isKnownType) {
    throw new Error(
      "Unknown diagram type. Must start with a valid mermaid diagram declaration."
    );
  }

  // Basic bracket and parentheses matching
  let brackets = 0;
  let parens = 0;
  let braces = 0;
  let quotes = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("%%") || line === "") continue; // Skip comments and empty lines

    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j - 1] : "";

      // Handle quote tracking
      if (char === '"' && prevChar !== "\\") {
        inQuotes = !inQuotes;
        quotes += inQuotes ? 1 : -1;
      }

      // Skip bracket counting inside quotes
      if (inQuotes) continue;

      switch (char) {
        case "[":
          brackets++;
          break;
        case "]":
          brackets--;
          break;
        case "(":
          parens++;
          break;
        case ")":
          parens--;
          break;
        case "{":
          braces++;
          break;
        case "}":
          braces--;
          break;
      }

      if (brackets < 0 || parens < 0 || braces < 0) {
        throw new Error(
          `Unmatched closing bracket/parenthesis at line ${i + 1}`
        );
      }
    }
  }

  if (brackets > 0) throw new Error("Unmatched opening square brackets");
  if (parens > 0) throw new Error("Unmatched opening parentheses");
  if (braces > 0) throw new Error("Unmatched opening braces");
  if (quotes > 0) throw new Error("Unmatched quotation marks");

  return true;
}

/**
 * Main mermaid validation function with fallback strategy
 * @param {string} content - Mermaid diagram content
 * @returns {Promise<boolean>} - True if valid, throws error if invalid
 */
export async function validateMermaidSyntax(content) {
  try {
    // First try the official mermaid parser (without DOM dependency)
    return await validateMermaidWithOfficialParser(content);
  } catch (officialError) {
    // If official parser fails due to environment issues, fall back to basic validation
    const errorMsg = officialError.message || String(officialError);

    if (
      errorMsg.includes("Cannot resolve module") ||
      errorMsg.includes("window is not defined") ||
      errorMsg.includes("canvas") ||
      errorMsg.includes("Web APIs") ||
      errorMsg.includes("getComputedTextLength") ||
      errorMsg.includes("document is not defined") ||
      errorMsg.includes("Cannot read properties of null") ||
      errorMsg.includes("Cannot read properties of undefined") ||
      errorMsg.includes("Cannot set property navigator") ||
      errorMsg.includes("DOMPurify.sanitize is not a function") ||
      (errorMsg.includes("navigator") && errorMsg.includes("getter"))
    ) {
      // Fall back to basic validation for environment issues
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          "Official mermaid parser failed, falling back to basic validation:",
          errorMsg
        );
      }
      return validateBasicMermaidSyntax(content);
    }

    // If it's a genuine syntax error, re-throw it
    throw officialError;
  }
}
