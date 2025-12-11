import { getActiveRulesForScope } from "../../utils/preferences-utils.mjs";
import { recordUpdate } from "../../utils/history-utils.mjs";
import { printDocumentStructure } from "../../utils/docs-finder-utils.mjs";
import equal from "fast-deep-equal";

export default async function userReviewDocumentStructure({ documentStructure, ...rest }, options) {
  // Check if documentation structure exists
  if (!documentStructure || !Array.isArray(documentStructure) || documentStructure.length === 0) {
    console.log("No documentation structure was generated to review.");
    return { documentStructure };
  }

  // Print current documentation structure in a user-friendly format
  if (!rest.isChat) {
    printDocumentStructure(documentStructure);

    // Ask user if they want to review the documentation structure
    const needReview = await options.prompts.select({
      message: "Would you like to refine the documentation structure?",
      choices: [
        {
          name: "No, looks good",
          value: "no",
        },
        {
          name: "Yes, optimize the structure (e.g. rename 'Getting Started' to 'Quick Start', move 'API Reference' before 'Configuration')",
          value: "yes",
        },
      ],
    });

    if (needReview === "no") {
      return { documentStructure };
    }
  }

  let currentStructure = documentStructure;

  const MAX_ITERATIONS = 100;
  let iterationCount = 0;

  // share current structure with updateDocumentStructure agent
  options.context.userContext.currentStructure = currentStructure;
  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    // Ask for feedback
    const feedback = rest.isChat
      ? rest.feedback
      : await options.prompts.input({
          message:
            "How would you like to improve the structure?\n" +
            "Examples:\n" +
            "  • Add a new document 'Troubleshooting'\n" +
            "  • Remove the 'Legacy Features' document\n" +
            "  • Move 'Installation' to the top of the structure\n\n" +
            "  Press Enter to finish reviewing:",
        });

    // If no feedback, break the loop
    if (!feedback?.trim()) {
      break;
    }

    // Get the refineDocumentStructure agent
    const refineAgent = options.context.agents["generateStructureExp"];
    if (!refineAgent) {
      console.log(
        "Unable to process your feedback - the documentation structure update feature is unavailable.",
      );
      console.log("Please try again later or contact support if this continues.");
      break;
    }

    // Get user preferences
    const structureRules = getActiveRulesForScope("structure", []);
    const globalRules = getActiveRulesForScope("global", []);
    const allApplicableRules = [...structureRules, ...globalRules];
    const ruleTexts = allApplicableRules.map((rule) => rule.rule);
    const userPreferences = ruleTexts.length > 0 ? ruleTexts.join("\n\n") : "";

    try {
      // Call refineDocumentStructure agent with feedback
      const { message, ...result } = await options.context.invoke(refineAgent, {
        ...rest,
        // dataSourceChunk: rest.dataSources[0].dataSourceChunk,
        userFeedback: feedback.trim(),
        // documentStructure: currentStructure,
        // userPreferences,
      });

      // currentStructure = options.context.userContext.currentStructure;
      currentStructure = result.documentStructure;

      if (rest.isChat && equal(currentStructure, documentStructure)) {
        throw new Error(
          `The suggested structure changes did not modify the existing documentation structure. ${message}`,
        );
      }

      // Check if feedback should be saved as user preference
      const feedbackRefinerAgent = options.context.agents["checkFeedbackRefiner"];
      if (feedbackRefinerAgent) {
        try {
          await options.context.invoke(feedbackRefinerAgent, {
            documentStructureFeedback: feedback.trim(),
            stage: "structure",
          });
        } catch (refinerError) {
          console.warn("Could not save feedback as a user preference:", refinerError.message);
          console.warn("Your feedback was applied but not saved as a preference.");
        }
      }

      // Record update in history
      recordUpdate({
        operation: "structure_update",
        feedback: feedback.trim(),
      });

      // Print current documentation structure in a user-friendly format
      printDocumentStructure(currentStructure);

      if (rest.isChat) {
        break;
      }
    } catch (error) {
      console.error("Error processing your feedback:");
      console.error(`Type: ${error.name}`);
      console.error(`Message: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
      console.log("\nPlease try rephrasing your feedback or continue with the current structure.");
      break;
    }
  }

  return { documentStructure: currentStructure };
}

userReviewDocumentStructure.taskTitle = "User review and modify documentation structure";
