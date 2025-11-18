import {
  buildAllowedLinksFromStructure,
  generateFileName,
  pathToFlatName,
  readFileContent,
} from "../../../utils/docs-finder-utils.mjs";
import { checkMarkdown } from "../../../utils/markdown-checker.mjs";

const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

export default async function findDocumentsWithInvalidLinks({
  documentStructure = [],
  docsDir,
  locale = "en",
}) {
  if (!Array.isArray(documentStructure) || documentStructure.length === 0) {
    return {
      documentsWithInvalidLinks: [],
    };
  }

  if (!docsDir) {
    return {
      documentsWithInvalidLinks: [],
      error: "docsDir is required to check document links",
    };
  }

  // Check each document for invalid links
  const allowedLinks = buildAllowedLinksFromStructure(documentStructure);
  const documentsWithInvalidLinks = [];

  for (const doc of documentStructure) {
    if (!doc.path) continue;

    // Generate filename from document path
    const flatName = pathToFlatName(doc.path);
    const fileName = generateFileName(flatName, locale);

    // Read document content
    const content = await readFileContent(docsDir, fileName);

    if (!content) {
      // Skip if content cannot be read
      continue;
    }

    // Use checkMarkdown to check for dead links
    const allErrors = await checkMarkdown(content, doc.path, {
      allowedLinks,
      baseDir: docsDir,
    });

    // Filter only dead link errors and extract invalid links
    const invalidLinks = allErrors
      .filter((msg) => msg.toLowerCase().includes("found a dead link in"))
      .map((msg) => {
        const match = linkRegex.exec(msg);
        if (match?.[2]) {
          return match[2].trim();
        }

        return "";
      })
      .filter(Boolean);

    if (invalidLinks.length > 0) {
      documentsWithInvalidLinks.push({
        path: doc.path,
        title: doc.title || doc.path,
        invalidLinks,
      });
    }
  }

  return {
    documentsWithInvalidLinks,
  };
}
