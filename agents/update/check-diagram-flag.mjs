/**
 * Check if --diagram or --diagram-all flag is set via command line arguments or environment variable
 * Returns the flag values and passes through all input
 * 
 * --diagram: Filter to show only documents with diagrams, let user select
 * --diagram-all: Auto-select all documents with diagrams, no user selection
 */
export default function checkDiagramFlag(input) {
  let shouldUpdateDiagrams = false;
  let shouldAutoSelectDiagrams = false;

  // Check command line arguments first (highest priority)
  if (process.argv) {
    const hasDiagramAllFlag = process.argv.some(
      (arg) => arg === "--diagram-all" || arg === "-da",
    );
    const hasDiagramFlag = process.argv.some((arg) => arg === "--diagram" || arg === "-d");

    if (hasDiagramAllFlag) {
      shouldUpdateDiagrams = true;
      shouldAutoSelectDiagrams = true;
    } else if (hasDiagramFlag) {
      shouldUpdateDiagrams = true;
      shouldAutoSelectDiagrams = false;
    }
  }

  // Check input parameter
  if (input.diagram === "all") {
    shouldUpdateDiagrams = true;
    shouldAutoSelectDiagrams = true;
  } else if (input.diagram === true || input.diagram === "true") {
    shouldUpdateDiagrams = true;
    shouldAutoSelectDiagrams = false;
  }

  // Check environment variable
  if (
    process.env.DOC_SMITH_UPDATE_DIAGRAMS === "all" ||
    process.env.DOC_SMITH_UPDATE_DIAGRAMS_ALL === "true" ||
    process.env.DOC_SMITH_UPDATE_DIAGRAMS_ALL === "1"
  ) {
    shouldUpdateDiagrams = true;
    shouldAutoSelectDiagrams = true;
  } else if (
    process.env.DOC_SMITH_UPDATE_DIAGRAMS === "true" ||
    process.env.DOC_SMITH_UPDATE_DIAGRAMS === "1"
  ) {
    shouldUpdateDiagrams = true;
    shouldAutoSelectDiagrams = false;
  }

  // Return all input plus the flags
  return {
    ...input,
    shouldUpdateDiagrams,
    shouldAutoSelectDiagrams,
  };
}

checkDiagramFlag.input_schema = {
  type: "object",
  properties: {
    diagram: {
      type: ["boolean", "string"],
      description:
        "Flag to trigger diagram update: 'all' for auto-select all, true for user selection (can also use --diagram or --diagram-all CLI args)",
    },
  },
};

checkDiagramFlag.output_schema = {
  type: "object",
  properties: {
    shouldUpdateDiagrams: {
      type: "boolean",
      description: "Whether to filter and update diagrams",
    },
    shouldAutoSelectDiagrams: {
      type: "boolean",
      description: "Whether to auto-select all documents with diagrams (true for --diagram-all, false for --diagram)",
    },
  },
  required: ["shouldUpdateDiagrams", "shouldAutoSelectDiagrams"],
};

