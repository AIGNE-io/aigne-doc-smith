import { basename } from "node:path";

/**
 * Prepare image generation parameters
 * @param {Object} input - Input parameters
 * @param {string} input.key - Image key
 * @param {string} input.id - Slot id
 * @param {string} input.desc - Slot description
 * @param {Array} input.documents - Associated document list
 * @param {string} input.locale - Main language
 * @param {boolean} input.isUpdate - Whether in update mode
 * @param {string|null} input.existingImagePath - Existing image path
 * @returns {Object} - Object containing original input and image generation parameters
 */
export default function prepareImageGeneration(input) {
  const { desc, documents, locale, isUpdate, existingImagePath } = input;

  // Use content from the first document
  const firstDoc = documents[0];
  const documentContent = firstDoc.content;

  // Prepare image generation parameters
  const imageGenParams = {
    documentContent,
    desc,
    locale,
    size: "2K",
    aspectRatio: "4:3",
    useImageToImage: isUpdate || false,
  };

  // If in update mode and existing image exists, add existingImage parameter
  if (isUpdate && existingImagePath) {
    imageGenParams.existingImage = [
      {
        type: "local",
        path: existingImagePath,
        filename: basename(existingImagePath),
        mimeType: "image/png",
      },
    ];
  }

  return {
    ...input, // Keep all original inputs
    ...imageGenParams, // Add image generation parameters
  };
}

// Add description
prepareImageGeneration.description =
  "Prepare image generation parameters, extract content from the first associated document, " +
  "configure image generation parameters (desc, locale, size, aspectRatio), " +
  "if in update mode, add existing image path for image-to-image generation.";

// Define input schema
prepareImageGeneration.input_schema = {
  type: "object",
  properties: {
    key: {
      type: "string",
      description: "Image key (directory name)",
    },
    id: {
      type: "string",
      description: "Slot id",
    },
    desc: {
      type: "string",
      description: "Slot description",
    },
    documents: {
      type: "array",
      description: "Associated document list",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          hash: { type: "string" },
          content: { type: "string" },
        },
      },
    },
    locale: {
      type: "string",
      description: "Main language code",
    },
    isUpdate: {
      type: "boolean",
      description: "Whether in update mode",
    },
    existingImagePath: {
      type: "string",
      nullable: true,
      description: "Existing image path (used in update mode)",
    },
  },
  required: ["key", "id", "desc", "documents", "locale"],
};

// Define output schema
prepareImageGeneration.output_schema = {
  type: "object",
  properties: {
    key: { type: "string" },
    id: { type: "string" },
    desc: { type: "string" },
    documents: { type: "array" },
    locale: { type: "string" },
    isUpdate: { type: "boolean" },
    existingImagePath: { type: "string", nullable: true },
    imageGenParams: {
      type: "object",
      description: "Parameters passed to image generation agent",
      properties: {
        documentContent: { type: "string" },
        desc: { type: "string" },
        locale: { type: "string" },
        size: { type: "string" },
        aspectRatio: { type: "string" },
        useImageToImage: { type: "boolean" },
        existingImage: {
          type: "array",
          nullable: true,
          items: { type: "object" },
        },
      },
    },
  },
};
