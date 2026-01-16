import { generateDocsDetailAfsModules } from "../../utils/afs-factory.mjs";

// Generate AFS modules at module load time
const afsModules = await generateDocsDetailAfsModules();

/**
 * Agent configuration for document detail generation
 */
export default {
  type: "@aigne/agent-library/agent-skill-manager",
  name: "generateDocumentDetail",
  description: "Generate detailed content for a single document based on document path and user requirements",
  instructions: {
    url: "./prompt.md",
  },
  session: {
    compact: {
      max_tokens: 150000,
    },
  },
  model: {
    cache_config: {
      autoBreakpoints: {
        lastMessage: true,
      },
    },
  },

  skills: [
    "../../agents/save-document/index.mjs", // Document saving tool
    "../../agents/content-checker/index.mjs", // Content validation tool
  ],

  input_schema: {
    type: "object",
    required: ["path"],
    properties: {
      path: {
        type: "string",
        description:
          'Document path, matching the path field in planning/document-structure.yaml (e.g., "/overview" or "/api/auth")',
      },
      customRequirements: {
        type: "string",
        description: "Additional requirements from user conversation (optional), used to guide content generation focus",
      },
    },
  },

  output_schema: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        description: "Whether the operation succeeded",
      },
      path: {
        type: "string",
        description: "Document path (present on success)",
      },
      summary: {
        type: "string",
        description: "Document summary, 200-300 characters (present on success)",
      },
      sections: {
        type: "array",
        items: {
          type: "string",
        },
        description: "List of main sections (present on success)",
      },
      imageSlots: {
        type: "array",
        items: {
          type: "string",
        },
        description: "List of generated AFS image slot IDs (present on success)",
      },
      validationResult: {
        type: "object",
        description: "Validation result from checkContent (present on success)",
      },
      error: {
        type: "string",
        description: "Error message (present on failure)",
      },
    },
  },

  afs: {
    modules: afsModules,
  },
};
