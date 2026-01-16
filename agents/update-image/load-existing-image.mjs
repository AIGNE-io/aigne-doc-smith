import { readFile, access, constants } from "node:fs/promises";
import { join } from "node:path";
import { parse as yamlParse } from "yaml";
import { PATHS } from "../../utils/agent-constants.mjs";
import { parseSlots } from "../../utils/image-slots.mjs";
import { findImageFile, getImageMimeType, calculateContentHash } from "../../utils/image-utils.mjs";
import { loadLocale } from "../../utils/config.mjs";

/**
 * Load existing image
 * @param {Object} input - Input parameters
 * @param {string} input.doc - Document path (e.g., "overview" or "/overview")
 * @param {string} input.slotId - slot id
 * @returns {Promise<Object>} - Load result
 */
export default async function loadExistingImage(input) {
  try {
    const { doc, slotId } = input;

    // Validate parameters
    if (!doc || !slotId) {
      throw new Error("Missing required parameters: doc and slotId");
    }

    // 1. Read main language
    const locale = await loadLocale();

    // 2. Build document file path
    const normalizedPath = doc.startsWith("/") ? doc.slice(1) : doc;
    const filePath = join(PATHS.DOCS_DIR, normalizedPath, `${locale}.md`);

    // Check if file exists
    try {
      await access(filePath, constants.F_OK | constants.R_OK);
    } catch (_error) {
      throw new Error(
        `Document does not exist or cannot be read: ${filePath}, please check if document path is in document-structure.yaml and document has been generated.`,
      );
    }

    // 3. Read document content
    const content = await readFile(filePath, "utf8");

    // 4. Calculate document content hash
    const hash = calculateContentHash(content);

    // 5. Parse slots, find specified slotId
    const slots = parseSlots(content, doc);
    const targetSlot = slots.find((s) => s.id === slotId);

    if (!targetSlot) {
      throw new Error(`Image slot with slotId="${slotId}" not found in document ${doc}`);
    }

    const { key, desc } = targetSlot;

    // 6. Load image file
    const imagesDir = join(PATHS.ASSETS_DIR, key, "images");
    const imagePath = await findImageFile(imagesDir, locale);

    if (!imagePath) {
      throw new Error(
        `Image file for slot "${slotId}" not found (key: ${key}), please confirm with user whether to use generateImages Tool to generate image first.`,
      );
    }

    // 7. Read .meta.yaml
    const metaPath = join(PATHS.ASSETS_DIR, key, ".meta.yaml");
    let meta = null;
    try {
      const metaContent = await readFile(metaPath, "utf8");
      meta = yamlParse(metaContent);
    } catch (_error) {
      // meta file does not exist or cannot be read, continue execution
    }

    // 8. Build image info (for existingImage parameter)
    const mimeType = getImageMimeType(imagePath);
    const filename = imagePath.split("/").pop();

    const existingImage = [
      {
        type: "local",
        path: imagePath,
        filename,
        mimeType,
      },
    ];

    // 9. Get current aspectRatio (from meta or use default)
    const currentAspectRatio = meta?.generation?.aspectRatio || "4:3";

    return {
      success: true,
      slotId,
      key,
      desc,
      doc,
      locale,
      content,
      hash,
      existingImage,
      currentAspectRatio,
      imagePath,
      meta,
      message: `Successfully loaded image: ${imagePath}`,
    };
  } catch (error) {
    throw new Error(`Failed to load existing image: ${error.message}, please check document path and slotId are correct`);
  }
}

// Add description
loadExistingImage.description = "Load existing image based on document path and slotId, return image path and related metadata.";

// Define input schema
loadExistingImage.input_schema = {
  type: "object",
  properties: {
    doc: {
      type: "string",
      description: "Document path (e.g., 'overview' or '/overview')",
    },
    slotId: {
      type: "string",
      description: "Image slot id",
    },
  },
  required: ["doc", "slotId"],
};

// Define output schema
loadExistingImage.output_schema = {
  type: "object",
  required: ["success"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether operation succeeded",
    },
    slotId: {
      type: "string",
      description: "slot id",
    },
    key: {
      type: "string",
      description: "Image key (directory name)",
    },
    desc: {
      type: "string",
      description: "slot description",
    },
    doc: {
      type: "string",
      description: "Document path",
    },
    locale: {
      type: "string",
      description: "Main language code",
    },
    content: {
      type: "string",
      description: "Document content",
    },
    hash: {
      type: "string",
      description: "SHA256 hash of document content",
    },
    existingImage: {
      type: "array",
      description: "Existing image info (for image-to-image generation)",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          path: { type: "string" },
          filename: { type: "string" },
          mimeType: { type: "string" },
        },
      },
    },
    currentAspectRatio: {
      type: "string",
      description: "Current image aspect ratio",
    },
    imagePath: {
      type: "string",
      description: "Image file path",
    },
    meta: {
      type: "object",
      nullable: true,
      description: "Image metadata (.meta.yaml content)",
    },
    message: {
      type: "string",
      description: "Operation result description",
    },
    error: {
      type: "string",
      description: "Error code (present on failure)",
    },
    suggestion: {
      type: "string",
      description: "Suggested action (present on failure)",
    },
  },
};
