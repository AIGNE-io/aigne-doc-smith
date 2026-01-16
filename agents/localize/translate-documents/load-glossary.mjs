import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { PATHS } from "../../../utils/agent-constants.mjs";

/**
 * Load glossary
 * @returns {Promise<Object>} - Object containing glossary content
 */
export default async function loadGlossary() {
  const glossaryPath = PATHS.GLOSSARY;

  try {
    // Check if glossary file exists
    await access(glossaryPath, constants.F_OK | constants.R_OK);

    // Read glossary content
    const glossary = await readFile(glossaryPath, "utf8");

    return {
      glossary: glossary.trim(),
      message: `Glossary loaded: ${glossaryPath}`,
    };
  } catch (_error) {
    // Glossary file does not exist, return empty string
    return {
      glossary: "",
      message: "Glossary file not found, will not use glossary",
    };
  }
}

// Add description
loadGlossary.description =
  "Load translation glossary file (intent/GLOSSARY.md). " +
  "If file exists, read content; otherwise return empty string. " +
  "Glossary content will be used in all translation tasks to ensure consistency of proper nouns.";

// Define output schema
loadGlossary.output_schema = {
  type: "object",
  required: ["glossary", "message"],
  properties: {
    glossary: {
      type: "string",
      description: "Glossary content (empty string if not exists)",
    },
    message: {
      type: "string",
      description: "Operation result description",
    },
  },
};
