import { getActiveRulesForScope } from "../../utils/preferences-utils.mjs";

function extractMarkdownHeadings(content) {
  if (!content || typeof content !== "string") {
    return [];
  }

  const lines = content.split("\n");
  const headings = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({
        level,
        text,
        prefix: "  ".repeat(level - 1) + "📄".repeat(1),
      });
    }
  }

  return headings;
}

function printDocumentHeadings(content, title) {
  console.log(`\n  ${"-".repeat(50)}`);
  console.log(`  Current Document: ${title}`);
  console.log(`  ${"-".repeat(50)}`);

  const headings = extractMarkdownHeadings(content);

  if (headings.length === 0) {
    console.log("  No headings found in document.");
  } else {
    headings.forEach((heading) => {
      console.log(`${heading.prefix} ${heading.text} (H${heading.level})`);
    });
  }
  console.log();
}

export default async function userReviewDocument(
  { content, title, description, ...rest },
  options,
) {
  // Check if document content exists
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    console.log("No document content was provided to review.");
    return { content };
  }

  // Print current document headings structure
  printDocumentHeadings(content, title || "Untitled Document");

  // Ask user if they want to review the document content
  const needReview = await options.prompts.select({
    message:
      "Would you like to optimize the document content?\n  You can provide feedback to improve the content quality and structure.",
    choices: [
      {
        name: "Looks good - proceed with current content",
        value: "no",
      },
      {
        name: "Yes, optimize the content",
        value: "yes",
      },
    ],
  });

  if (needReview === "no") {
    return { content };
  }

  let currentContent = content;

  const MAX_ITERATIONS = 100;
  let iterationCount = 0;
  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;

    // Ask for feedback
    const feedback = await options.prompts.input({
      message:
        "How would you like to improve the document content?\n" +
        "  • Add, modify, or remove contents\n" +
        "  • Improve clarity, accuracy, or completeness\n" +
        "  • Adjust tone, style, or technical level\n\n" +
        "  Press Enter to finish reviewing:",
    });

    // If no feedback, break the loop
    if (!feedback?.trim()) {
      break;
    }

    // Get the updateDocument agent
    const updateAgent = options.context.agents["updateDocumentDetail"];
    if (!updateAgent) {
      console.log("Unable to process your feedback - the document update feature is unavailable.");
      console.log("Please try again later or contact support if this continues.");
      break;
    }

    // Get user preferences
    const contentRules = getActiveRulesForScope("document", [rest.path]);
    const globalRules = getActiveRulesForScope("global");
    const allApplicableRules = [...contentRules, ...globalRules];
    const ruleTexts = allApplicableRules.map((rule) => rule.rule);
    const userPreferences = ruleTexts.length > 0 ? ruleTexts.join("\n\n") : "";

    try {
      // Call updateDocument agent with feedback
      const result = await options.context.invoke(updateAgent, {
        ...rest,
        originalContent: currentContent,
        feedback: feedback.trim(),
        userPreferences,
      });

      if (result.updatedContent) {
        currentContent = result.updatedContent;
        console.log(`\n✅ ${result.operationSummary || "Document updated successfully"}\n`);
      } else {
        console.log("\n❌ Failed to update the document. Please try rephrasing your feedback.\n");
      }

      // Check if feedback should be saved as user preference
      const feedbackRefinerAgent = options.context.agents["checkFeedbackRefiner"];
      if (feedbackRefinerAgent) {
        try {
          await options.context.invoke(feedbackRefinerAgent, {
            documentContentFeedback: feedback.trim(),
            stage: "document_refine",
          });
        } catch (refinerError) {
          console.warn("Could not save feedback as user preference:", refinerError.message);
          console.warn("Your feedback was applied but not saved as a preference.");
        }
      }

      // Print updated document headings structure
      printDocumentHeadings(currentContent, title || "Untitled Document");
    } catch (error) {
      console.error("Error processing your feedback:");
      console.error(`Type: ${error.name}`);
      console.error(`Message: ${error.message}`);
      if (error.stack) {
        console.error(`Stack: ${error.stack}`);
      }
      console.log("\nPlease try rephrasing your feedback or continue with the current content.");
      break;
    }
  }

  return { content: currentContent };
}

userReviewDocument.taskTitle = "User review and modify document content";
