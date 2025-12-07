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

  // Priority order: command line args > input params > environment variables
  // Check command line arguments first (highest priority)
  if (process.argv) {
    // Check for --diagram-all or -da (exact match)
    const hasDiagramAllFlag = process.argv.some((arg) => arg === "--diagram-all" || arg === "-da");

    const hasDiagramFlag = process.argv.some((arg) => arg === "--diagram" || arg === "-d");

    if (hasDiagramAllFlag) {
      shouldUpdateDiagrams = true;
      shouldAutoSelectDiagrams = true;
      // Return early if CLI arg found (highest priority)
      return {
        ...input,
        shouldUpdateDiagrams,
        shouldAutoSelectDiagrams,
      };
    } else if (hasDiagramFlag) {
      shouldUpdateDiagrams = true;
      shouldAutoSelectDiagrams = false;
      // Return early if CLI arg found (highest priority)
      return {
        ...input,
        shouldUpdateDiagrams,
        shouldAutoSelectDiagrams,
      };
    }
  }

  // Check input parameter (second priority - CLI framework might parse --diagram-all as separate parameter)
  if (input["diagram-all"] === true || input["diagram-all"] === "true") {
    shouldUpdateDiagrams = true;
    shouldAutoSelectDiagrams = true;
    // Return early if input param found (second priority)
    return {
      ...input,
      shouldUpdateDiagrams,
      shouldAutoSelectDiagrams,
    };
  } else if (input.diagram === true || input.diagram === "true") {
    shouldUpdateDiagrams = true;
    shouldAutoSelectDiagrams = false;
    // Return early if input param found (second priority)
    return {
      ...input,
      shouldUpdateDiagrams,
      shouldAutoSelectDiagrams,
    };
  }

  // Check environment variable (lowest priority)
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
        "Flag to trigger diagram update: true for user selection (can also use --diagram CLI arg)",
    },
    "diagram-all": {
      type: ["boolean", "string"],
      description:
        "Flag to auto-select all documents with diagrams (can also use --diagram-all CLI arg)",
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
      description:
        "Whether to auto-select all documents with diagrams (true for --diagram-all, false for --diagram)",
    },
  },
  required: ["shouldUpdateDiagrams", "shouldAutoSelectDiagrams"],
};
