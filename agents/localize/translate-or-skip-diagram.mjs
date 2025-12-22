import { debug } from "../../utils/debug.mjs";

/**
 * Check --diagram flag and conditionally translate document
 * If --diagram is set, skip document translation and only translate images
 * Otherwise, proceed with normal document translation
 */
export default async function translateOrSkipDiagram(input) {
  // Check if --diagram flag is set
  let shouldTranslateDiagramsOnly = false;

  if (process.argv) {
    const hasDiagramFlag = process.argv.some((arg) => arg === "--diagram" || arg === "-d");
    if (hasDiagramFlag) {
      shouldTranslateDiagramsOnly = true;
    }
  }

  if (input.diagram === true || input.diagram === "true") {
    shouldTranslateDiagramsOnly = true;
  }

  if (
    process.env.DOC_SMITH_TRANSLATE_DIAGRAMS_ONLY === "true" ||
    process.env.DOC_SMITH_TRANSLATE_DIAGRAMS_ONLY === "1"
  ) {
    shouldTranslateDiagramsOnly = true;
  }

  // If --diagram flag is set, skip document translation
  if (shouldTranslateDiagramsOnly) {
    debug("⏭️  --diagram flag set: skipping document translation, only translating images");
    // Set translation to content to skip actual translation
    // Also set isApproved to true to skip reflection check
    return {
      ...input,
      shouldTranslateDiagramsOnly: true,
      translation: input.content || "",
      reviewContent: input.content || "",
      isApproved: true, // Skip reflection check
    };
  }

  // Otherwise, proceed with normal translation
  // Don't call translateDocument here - let translate-document-wrapper.mjs handle it
  return {
    ...input,
    shouldTranslateDiagramsOnly: false,
  };
}

translateOrSkipDiagram.task_render_mode = "hide";
