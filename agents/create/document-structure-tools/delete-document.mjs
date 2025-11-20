import {
  getDeleteDocumentInputJsonSchema,
  getDeleteDocumentOutputJsonSchema,
  validateDeleteDocumentInput,
} from "../../../types/document-structure-schema.mjs";
import { userContextAt } from "../../../utils/utils.mjs";

export default async function deleteDocument(input, options) {
  // Validate input using Zod schema
  const validation = validateDeleteDocumentInput(input);
  if (!validation.success) {
    const errorMessage = `Cannot delete document: ${validation.error}`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure: input.documentStructure,
      error: { message: errorMessage },
    };
  }

  const { path, recursive = false } = validation.data;
  let documentStructure = options?.context?.userContext?.currentStructure;

  if (!documentStructure) {
    documentStructure = input.documentStructure;
  }

  const deletedPathsContext = userContextAt(options, "deletedPaths");
  const deletedPaths = deletedPathsContext.get() || [];

  // Check if path has already been deleted
  if (recursive) {
    if (deletedPaths.includes(path)) {
      const message = `Skipping duplicate deletion. Document '${path}' have already been deleted.`;
      return {
        documentStructure,
        message,
        deletedDocuments: [],
      };
    }
  }

  // Find the document to delete
  const documentIndex = documentStructure.findIndex((item) => item.path === path);
  if (documentIndex === -1) {
    const errorMessage = `Cannot delete document: Document '${path}' does not exist. Please choose an existing document to delete.`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure,
      error: { message: errorMessage },
    };
  }

  const documentToDelete = documentStructure[documentIndex];

  // Find all child documents (direct and indirect)
  const findAllChildren = (parentPath, structure) => {
    const children = structure.filter((item) => item.parentId === parentPath);
    const allChildren = [...children];
    for (const child of children) {
      allChildren.push(...findAllChildren(child.path, structure));
    }
    return allChildren;
  };

  const childDocuments = findAllChildren(path, documentStructure);

  // If recursive is false and there are child documents, return error
  if (!recursive && childDocuments.length > 0) {
    const errorMessage = `Cannot delete document: Document '${path}' has ${
      childDocuments.length
    } child document(s): ${childDocuments
      .map((p) => p.path)
      .join(
        ", ",
      )}. Please first move or delete these child documents, or set recursive=true to delete them all.`;
    console.log(`⚠️  ${errorMessage}`);
    return {
      documentStructure,
      error: { message: errorMessage },
    };
  }

  // Collect all documents to delete (children first, then parent)
  const documentsToDelete = recursive ? [...childDocuments, documentToDelete] : [documentToDelete];
  const pathsToDelete = new Set(documentsToDelete.map((doc) => doc.path));
  const deletedCount = pathsToDelete.size - 1;

  // Remove all documents from the structure
  const updatedStructure = documentStructure.filter((item) => !pathsToDelete.has(item.path));

  // Add paths to deleted paths
  if (recursive) {
    deletedPathsContext.set(deletedPaths.concat(Array.from(pathsToDelete)));
  }

  // Build success message
  const successMessage = `deleteDocument executed successfully.
  Successfully deleted document '${documentToDelete.title}' with path '${path}'${recursive && deletedCount > 0 ? ` along with ${deletedCount} child document(s)` : ""}.
  Check if the latest version of documentStructure meets user feedback, if so, just return 'success'.`;

  // update shared document structure
  if (options?.context?.userContext) {
    options.context.userContext.currentStructure = updatedStructure;
  }

  return {
    documentStructure: updatedStructure,
    message: successMessage,
    deletedDocuments: documentsToDelete,
  };
}

deleteDocument.taskTitle = "Delete document";
deleteDocument.description = "Remove a document from the documentation structure";
deleteDocument.inputSchema = getDeleteDocumentInputJsonSchema();
deleteDocument.outputSchema = getDeleteDocumentOutputJsonSchema();
