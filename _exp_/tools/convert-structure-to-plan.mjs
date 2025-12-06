import { z } from "zod";

/**
 * Converts the new YAML document structure format to the old structure plan JSON format.
 *
 * New format (YAML):
 * ```yaml
 * project:
 *   title: "Project Name"
 *   description: "Project description"
 * documents:
 *   - title: "Getting Started"
 *     description: "Introduction"
 *     sourcePaths: ["README.md"]
 *     children:
 *       - title: "Installation"
 *         description: "How to install"
 *         sourcePaths: ["docs/install.md"]
 *         children: []
 * ```
 *
 * Old format (JSON array):
 * ```json
 * [
 *   {
 *     "title": "Getting Started",
 *     "description": "Introduction",
 *     "path": "/getting-started",
 *     "parentId": null,
 *     "sourceIds": ["README.md"]
 *   },
 *   {
 *     "title": "Installation",
 *     "description": "How to install",
 *     "path": "/getting-started/installation",
 *     "parentId": "/getting-started",
 *     "sourceIds": ["docs/install.md"]
 *   }
 * ]
 * ```
 */
export default async function convertStructureToPlan(_, options) {
  const yaml = await import("yaml");

  const originalStructure = options.context.userContext.documentStructure;

  if (!originalStructure) {
    throw new Error("No document structure found in context");
  }

  const parsed = yaml.parse(originalStructure);
  const validated = newStructureSchema.parse(parsed);

  // Convert to old format
  const oldFormatStructure = convertToOldFormat(validated);

  return {
    projectName: validated.project.title,
    projectDesc: validated.project.description,
    documentStructure: oldFormatStructure,
  };
}

convertStructureToPlan.description = `
  Converts the new YAML document structure format to the old structure plan JSON format.
  The old format is a flat array of document items with path/parentId relationships.
`;

/**
 * Converts the new hierarchical YAML structure to the old flat JSON array format
 */
function convertToOldFormat(newStructure) {
  const result = [];

  /**
   * Recursively processes document nodes and converts them to the old format
   * @param {object} doc - Document node from new structure
   * @param {string|null} parentPath - Path of parent document (null for root)
   * @param {string} basePath - Base path for generating document path
   */
  function processDocument(doc, parentPath, basePath) {
    // Generate path from title (slugify)
    const slug = doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const path = basePath ? `${basePath}/${slug}` : `/${slug}`;

    // Create old format document item
    const oldFormatDoc = {
      title: doc.title,
      description: doc.description,
      path: path,
      parentId: parentPath,
      sourceIds: doc.sourcePaths || [],
    };

    result.push(oldFormatDoc);

    // Process children recursively
    if (doc.children && doc.children.length > 0) {
      for (const child of doc.children) {
        processDocument(child, path, path);
      }
    }
  }

  // Process all top-level documents
  if (newStructure.documents && Array.isArray(newStructure.documents)) {
    for (const doc of newStructure.documents) {
      processDocument(doc, null, "");
    }
  }

  return result;
}

// New YAML structure schema
const documentSchema = z.object({
  title: z.string(),
  description: z.string(),
  sourcePaths: z.array(z.string()),
  children: z.array(z.lazy(() => documentSchema)).nullish(),
});

const newStructureSchema = z.object({
  project: z.object({
    title: z.string().nullish(),
    description: z.string().nullish(),
  }),
  documents: z.array(documentSchema),
});

// Old JSON structure schema (for validation)
const oldDocumentItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  path: z.string().startsWith("/"),
  parentId: z.string().nullable(),
  sourceIds: z.array(z.string()),
});

const oldStructureSchema = z.array(oldDocumentItemSchema);
