/**
 * Check if --diagram-sync flag is set via command line arguments or environment variable
 * Returns the flag value and passes through all input
 *
 * --diagram-sync: Auto-select all documents with banana images and sync to translations
 */
export default function checkSyncImageFlag(input) {
  let shouldSyncImages = false;

  // Check command line arguments first (highest priority)
  if (process.argv) {
    const hasSyncImageFlag = process.argv.some((arg) => arg === "--diagram-sync" || arg === "-ds");
    if (hasSyncImageFlag) {
      shouldSyncImages = true;
    }
  }

  // Check input parameter
  if (input["diagram-sync"] === true || input.diagramSync === true) {
    shouldSyncImages = true;
  }

  // Check environment variable
  if (process.env.DOC_SMITH_SYNC_IMAGES === "true" || process.env.DOC_SMITH_SYNC_IMAGES === "1") {
    shouldSyncImages = true;
  }

  // Return all input plus the flag
  return {
    ...input,
    shouldSyncImages,
  };
}

checkSyncImageFlag.input_schema = {
  type: "object",
  properties: {
    "diagram-sync": {
      type: ["boolean", "string"],
      description:
        "Flag to sync images to translations (can also use --diagram-sync CLI arg or DOC_SMITH_SYNC_IMAGES env var)",
    },
  },
};

checkSyncImageFlag.output_schema = {
  type: "object",
  properties: {
    shouldSyncImages: {
      type: "boolean",
      description: "Whether to sync images to translations",
    },
  },
  required: ["shouldSyncImages"],
};
