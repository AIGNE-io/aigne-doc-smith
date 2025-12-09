import chalk from "chalk";
import {
  addFeedbackToItems,
  findItemByPath,
  getActionText,
  getMainLanguageFiles,
  processSelectedFiles,
  readFileContent,
} from "../../utils/docs-finder-utils.mjs";
import {
  hasDiagramContent,
  hasBananaImages,
  getDiagramTypeLabels,
  formatDiagramTypeSuffix,
} from "../../utils/check-document-has-diagram.mjs";
import { debug } from "../../utils/debug.mjs";
import { DOC_ACTION } from "../../utils/constants/index.mjs";

function getFeedbackMessage(action) {
  if (action === DOC_ACTION.translate) {
    return "Any specific translation preferences or instructions? (Press Enter to skip):";
  }
  return "How would you like to improve this document? (Press Enter to skip)";
}

export default async function chooseDocs(
  {
    docs,
    documentStructure,
    boardId,
    docsDir,
    isTranslate,
    feedback,
    locale,
    reset = false,
    requiredFeedback = true,
    action,
    shouldUpdateDiagrams = false,
    shouldAutoSelectDiagrams = false,
    shouldSyncImages = false,
    ...rest
  },
  options,
) {
  let foundItems = [];
  let selectedFiles = [];
  const docAction = action || (isTranslate ? DOC_ACTION.translate : DOC_ACTION.update);

  // If docs is empty or not provided, let user select multiple documents
  if (!docs || docs.length === 0) {
    try {
      // Get all main language .md files in docsDir
      const mainLanguageFiles = await getMainLanguageFiles(docsDir, locale, documentStructure);

      if (mainLanguageFiles.length === 0) {
        throw new Error(
          `No documents found in the docs directory. You can generate them with ${chalk.yellow(
            "`aigne doc create`",
          )}`,
        );
      }

      // If --diagram-sync flag is set, filter documents by banana images only
      if (shouldSyncImages) {
        debug("🔄 Filtering documents with banana images...");

        // Read content for all files and filter by banana images only
        const filesWithImages = [];
        for (const fileName of mainLanguageFiles) {
          const content = await readFileContent(docsDir, fileName);
          if (content && hasBananaImages(content)) {
            filesWithImages.push(fileName);
          }
        }

        if (filesWithImages.length === 0) {
          debug("ℹ️  No documents found with banana images (DIAGRAM_IMAGE_START markers).");
          return {
            selectedDocs: [],
            feedback: "",
            selectedPaths: [],
          };
        }

        debug(`✅ Found ${filesWithImages.length} document(s) with banana images.`);
        debug("📋 Auto-selecting all documents with banana images...");
        // Show diagram types for each document
        for (const file of filesWithImages) {
          const content = await readFileContent(docsDir, file);
          const diagramLabels = content ? getDiagramTypeLabels(content) : [];
          const diagramSuffix = formatDiagramTypeSuffix(diagramLabels);
          debug(`   • ${file}${diagramSuffix}`);
        }
        selectedFiles = filesWithImages;
      }
      // If --diagram flag is set, filter documents by diagram content
      else if (shouldUpdateDiagrams) {
        debug("🔄 Filtering documents with diagram content...");

        // Read content for all files and filter by diagram content
        const filesWithDiagrams = [];
        for (const fileName of mainLanguageFiles) {
          const content = await readFileContent(docsDir, fileName);
          if (content && hasDiagramContent(content)) {
            filesWithDiagrams.push(fileName);
          }
        }

        if (filesWithDiagrams.length === 0) {
          debug(
            "ℹ️  No documents found with diagram content (d2 code blocks, placeholders, or diagram images).",
          );
          return {
            selectedDocs: [],
            feedback: "",
            selectedPaths: [],
          };
        }

        debug(`✅ Found ${filesWithDiagrams.length} document(s) with diagram content.`);

        // If --diagram-all, auto-select all; otherwise let user choose
        if (shouldAutoSelectDiagrams) {
          debug("📋 Auto-selecting all documents with diagrams...");
          // Show diagram types for each document in auto-select mode
          for (const file of filesWithDiagrams) {
            const content = await readFileContent(docsDir, file);
            const diagramLabels = content ? getDiagramTypeLabels(content) : [];
            const diagramSuffix = formatDiagramTypeSuffix(diagramLabels);
            debug(`   • ${file}${diagramSuffix}`);
          }
          selectedFiles = filesWithDiagrams;
        } else {
          // --diagram mode: show only documents with diagrams, let user select
          const choices = await Promise.all(
            filesWithDiagrams.map(async (file) => {
              // Convert filename to flat path to find corresponding documentation structure item
              const flatName = file.replace(/\.md$/, "").replace(/\.\w+(-\w+)?$/, "");
              const docItem = documentStructure.find((item) => {
                const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
                return itemFlattenedPath === flatName;
              });

              // Read content to detect diagram types
              const content = await readFileContent(docsDir, file);
              const diagramLabels = content ? getDiagramTypeLabels(content) : [];
              const diagramSuffix = formatDiagramTypeSuffix(diagramLabels);

              // Use title if available, otherwise fall back to filename
              let displayName = docItem?.title;
              if (displayName) {
                displayName = `${displayName} (${file})${diagramSuffix}`;
              } else {
                displayName = `${file}${diagramSuffix}`;
              }

              return {
                name: displayName,
                value: file,
              };
            }),
          );

          // Let user select multiple files from filtered list
          selectedFiles = await options.prompts.checkbox({
            message: getActionText("Select documents with diagrams to {action}:", docAction),
            source: (term) => {
              if (!term) return choices;

              return choices.filter((choice) =>
                choice.name.toLowerCase().includes(term.toLowerCase()),
              );
            },
            validate: (answer) => {
              if (answer.length === 0) {
                return "Please select at least one document";
              }
              return true;
            },
          });

          if (!selectedFiles || selectedFiles.length === 0) {
            throw new Error("No documents selected");
          }
        }
      } else {
        // Normal flow: let user select documents from all files
        // Convert files to choices with titles
        const choices = mainLanguageFiles.map((file) => {
          // Convert filename to flat path to find corresponding documentation structure item
          const flatName = file.replace(/\.md$/, "").replace(/\.\w+(-\w+)?$/, "");
          const docItem = documentStructure.find((item) => {
            const itemFlattenedPath = item.path.replace(/^\//, "").replace(/\//g, "-");
            return itemFlattenedPath === flatName;
          });

          // Use title if available, otherwise fall back to filename
          let displayName = docItem?.title;
          if (displayName) {
            displayName = `${displayName} (${file})`;
          } else {
            displayName = file;
          }

          return {
            name: displayName,
            value: file,
          };
        });

        // Let user select multiple files
        selectedFiles = await options.prompts.checkbox({
          message: getActionText("Select documents to {action}:", docAction),
          source: (term) => {
            if (!term) return choices;

            return choices.filter((choice) =>
              choice.name.toLowerCase().includes(term.toLowerCase()),
            );
          },
          validate: (answer) => {
            if (answer.length === 0) {
              return "Please select at least one document";
            }
            return true;
          },
        });

        if (!selectedFiles || selectedFiles.length === 0) {
          throw new Error("No documents selected");
        }
      }

      // Process selected files and convert to found items
      foundItems = await processSelectedFiles(selectedFiles, documentStructure, docsDir);
    } catch (error) {
      debug(getActionText(`\nFailed to select documents to {action}: ${error.message}`, docAction));
      process.exit(0);
    }
  } else {
    // Process the provided docs array
    for (const docPath of docs) {
      const foundItem = await findItemByPath(documentStructure, docPath, boardId, docsDir, locale);

      if (!foundItem) {
        debug(`⚠️  Item with path "${docPath}" not found in documentStructure`);
        continue;
      }

      foundItems.push({
        ...foundItem,
      });
    }

    if (foundItems.length === 0) {
      throw new Error("None of the specified document paths were found in documentStructure");
    }
  }

  // Prompt for feedback if not provided
  // Skip feedback prompt if --diagram, --diagram-all, or --diagram-sync flag is set
  let userFeedback = feedback;
  if (
    !userFeedback &&
    (requiredFeedback || foundItems?.length > 1) &&
    !shouldUpdateDiagrams &&
    !shouldSyncImages &&
    !rest.isChat
  ) {
    const feedbackMessage = getFeedbackMessage(docAction);

    userFeedback = await options.prompts.input({
      message: feedbackMessage,
    });
  }

  // Add feedback to all results if provided
  foundItems = addFeedbackToItems(foundItems, userFeedback);

  // if reset is true, set content to null for all items
  if (reset) {
    foundItems = foundItems.map((item) => ({
      ...item,
      content: null,
    }));
  }

  return {
    selectedDocs: foundItems,
    feedback: userFeedback,
    selectedPaths: foundItems.map((item) => item.path),
  };
}
