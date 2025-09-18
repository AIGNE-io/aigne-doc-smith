import { getActiveRulesForScope } from "../../utils/preferences-utils.mjs";

function formatDocumentStructure(structure) {
  // Build a tree structure for better display
  const nodeMap = new Map();
  const rootNodes = [];

  // First pass: create node map
  structure.forEach((node) => {
    nodeMap.set(node.path, {
      ...node,
      children: [],
    });
  });

  // Second pass: build tree structure
  structure.forEach((node) => {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(nodeMap.get(node.path));
      } else {
        rootNodes.push(nodeMap.get(node.path));
      }
    } else {
      rootNodes.push(nodeMap.get(node.path));
    }
  });

  function printNode(node, depth = 0) {
    const INDENT_SPACES = "  ";
    const FOLDER_ICON = "  📁";
    const FILE_ICON = "  📄";
    const indent = INDENT_SPACES.repeat(depth);
    const prefix = depth === 0 ? FOLDER_ICON : FILE_ICON;

    console.log(`${indent}${prefix} ${node.title}`);

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        printNode(child, depth + 1);
      });
    }
  }

  return { rootNodes, printNode };
}

function printDocumentStructure(structure) {
  console.log(`\n  ${"-".repeat(50)}`);
  console.log("  Current Document Structure");
  console.log(`  ${"-".repeat(50)}`);

  const { rootNodes, printNode } = formatDocumentStructure(structure);

  if (rootNodes.length === 0) {
    console.log("  No document structure found.");
  } else {
    rootNodes.forEach((node) => printNode(node));
  }
  console.log();
}

export default async function userReviewDocumentStructure({ documentStructure, ...rest }, options) {
  // Check if document structure exists
  if (!documentStructure || !Array.isArray(documentStructure) || documentStructure.length === 0) {
    console.log("No document structure was generated to review.");
    return { documentStructure };
  }

  // Print current document structure in a user-friendly format
  printDocumentStructure(documentStructure);

  // Ask user if they want to review the document structure
  const needReview = await options.prompts.select({
    message:
      "Would you like to optimize the document structure?\n  You can modify titles, reorganize sections.",
    choices: [
      {
        name: "Looks good - proceed with current structure",
        value: "no",
      },
      {
        name: "Yes, optimize the structure",
        value: "yes",
      },
    ],
  });

  if (needReview === "no") {
    return { documentStructure };
  }

  let currentStructure = documentStructure;

  const MAX_ITERATIONS = 100;
  let iterationCount = 0;
  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    // Ask for feedback
    const feedback = await options.prompts.input({
      message:
        "How would you like to improve the structure?\n" +
        "  • Rename, reorganize, add, or remove sections\n\n" +
        "  Press Enter to finish reviewing:",
    });

    // If no feedback, break the loop
    if (!feedback?.trim()) {
      break;
    }

    // Get the refineDocumentStructure agent
    const refineAgent = options.context.agents["refineDocumentStructure"];
    if (!refineAgent) {
      console.log(
        "Unable to process your feedback - the structure refinement feature is unavailable.",
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
      const result = await options.context.invoke(refineAgent, {
        ...rest,
        feedback: feedback.trim(),
        originalDocumentStructure: currentStructure,
        userPreferences,
      });

      if (result.documentStructure) {
        currentStructure = result.documentStructure;
      }

      // Print current document structure in a user-friendly format
      printDocumentStructure(currentStructure);

      // Check if feedback should be saved as user preference
      const feedbackRefinerAgent = options.context.agents["checkFeedbackRefiner"];
      if (feedbackRefinerAgent) {
        try {
          await options.context.invoke(feedbackRefinerAgent, {
            documentStructureFeedback: feedback.trim(),
            stage: "structure",
          });
        } catch (refinerError) {
          console.warn("Could not save feedback as user preference:", refinerError.message);
          console.warn("Your feedback was applied but not saved as a preference.");
        }
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

userReviewDocumentStructure.taskTitle = "User review and modify document structure";
