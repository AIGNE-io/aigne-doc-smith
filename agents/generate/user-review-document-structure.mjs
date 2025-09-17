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
    const indent = "  ".repeat(depth);
    const prefix = depth === 0 ? "📁" : "📄";

    console.log(`${indent}${prefix} ${node.title}`);
    console.log(`${indent}   Path: ${node.path}`);
    console.log(`${indent}   Content Outline: ${node.description}\n`);

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        printNode(child, depth + 1);
      });
    }

    if (depth === 0) console.log(); // Add spacing between root nodes
  }

  return { rootNodes, printNode };
}

export default async function userReviewDocumentStructure({ documentStructure, ...rest }, options) {
  // Check if document structure exists
  if (!documentStructure || !Array.isArray(documentStructure) || documentStructure.length === 0) {
    console.log("No document structure to review.");
    return { documentStructure };
  }

  // Ask user if they want to review the document structure
  const needReview = await options.prompts.select({
    message: "Do you want to review or modify the document structure?",
    choices: [
      {
        name: "No, proceed with current structure",
        value: "no",
      },
      {
        name: "Yes, I want to review and modify",
        value: "yes",
      },
    ],
  });

  if (needReview === "no") {
    return { documentStructure };
  }

  let currentStructure = documentStructure;

  while (true) {
    // Print current document structure in a user-friendly format
    console.log(`\n${"=".repeat(50)}`);
    console.log("📋 Current Document Structure");
    console.log("=".repeat(50));

    const { rootNodes, printNode } = formatDocumentStructure(currentStructure);

    if (rootNodes.length === 0) {
      console.log("No document structure found.");
    } else {
      rootNodes.forEach((node) => printNode(node));
    }

    console.log(`${"=".repeat(50)}\n`);

    // Ask for feedback
    const feedback = await options.prompts.input({
      message:
        "Please provide your feedback for improving the document structure (press Enter to skip):",
    });

    // If no feedback, break the loop
    if (!feedback?.trim()) {
      break;
    }

    // Get the refineDocumentStructure agent
    const refineAgent = options.context.agents["refineDocumentStructure"];
    if (!refineAgent) {
      console.error("refineDocumentStructure agent not found");
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
    } catch (error) {
      console.error("Error refining document structure:", error.message);
      break;
    }
  }

  return { documentStructure: currentStructure };
}

userReviewDocumentStructure.taskTitle = "User review and modify document structure";
