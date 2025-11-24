import { getActiveRulesForScope } from "../../../utils/preferences-utils.mjs";
import { printDocumentStructure } from "../../../utils/docs-finder-utils.mjs";

export default async function addDocumentsToStructure(input = {}, options = {}) {
  const { originalDocumentStructure = [] } = input;
  const analyzeIntent = options.context?.agents?.["analyzeStructureFeedbackIntent"];
  const updateDocumentStructure = options.context?.agents?.["updateDocumentStructure"];
  const allFeedback = [];
  let currentStructure = [...originalDocumentStructure];
  let isFirstAdd = true;

  printDocumentStructure(originalDocumentStructure);

  // update website structure
  if (!options.context.userContext) {
    options.context.userContext = {};
  }

  // Add document
  while (true) {
    let feedback = await options.prompts.input({
      message: isFirstAdd
        ? "You can add a new document.\n" +
          "  • e.g. Add a new document 'Troubleshooting'\n\n" +
          "Press Enter to finish:"
        : "You can continue adding documents, or press Enter to finish:",
    });

    feedback = feedback.trim();

    // end the loop
    if (!feedback) {
      break;
    }

    try {
      // validate feedback
      const { intentType } = await options.context.invoke(analyzeIntent, {
        feedback,
      });

      if (intentType !== "add") {
        console.log(`⚠️  You can only add documents at this stage.`);
        continue;
      }
      options.context.userContext.currentStructure = currentStructure;

      const structureRules = getActiveRulesForScope("structure", []);
      const globalRules = getActiveRulesForScope("global", []);
      const allApplicableRules = [...structureRules, ...globalRules];
      const userPreferences = allApplicableRules.map((rule) => rule.rule).join("\n\n");

      await options.context.invoke(updateDocumentStructure, {
        ...input,
        dataSourceChunk: input.dataSources[0].dataSourceChunk,
        feedback,
        documentStructure: currentStructure,
        needDataSources: true,
        userPreferences,
      });

      allFeedback.push(feedback);

      currentStructure = options.context.userContext.currentStructure;
      printDocumentStructure(currentStructure);
      isFirstAdd = false;
    } catch (error) {
      console.error("Error processing feedback:", {
        type: error.name,
        message: error.message,
      });
      process.exit(0);
    }
  }

  if (currentStructure.length > originalDocumentStructure.length) {
    const originalPaths = new Set(originalDocumentStructure.map((doc) => doc.path));
    const newDocuments = currentStructure.filter((doc) => !originalPaths.has(doc.path));

    return {
      originalDocumentStructure: currentStructure,
      documentStructure: JSON.parse(JSON.stringify(currentStructure)),
      newDocuments,
      allFeedback,
    };
  } else {
    console.log("No documents were added");
    process.exit(0);
  }
}
