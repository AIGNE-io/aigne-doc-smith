import { marked } from "marked";
import markedTerminal from "marked-terminal";
import { getActiveRulesForScope } from "../../utils/preferences-utils.mjs";

function extractMarkdownHeadings(content) {
  if (!content || typeof content !== "string") {
    return [];
  }

  const headings = [];

  try {
    // Use marked's lexer to tokenize the content
    const tokens = marked.lexer(content);

    // Extract heading tokens
    function processTokens(tokenArray) {
      for (const token of tokenArray) {
        if (token.type === "heading") {
          headings.push({
            level: token.depth,
            text: token.text.trim(),
            prefix: "  ".repeat(token.depth - 1) + "📄".repeat(1),
          });
        }
        // Process nested tokens if they exist (for lists, block quotes, etc.)
        if (token.tokens) {
          processTokens(token.tokens);
        }
      }
    }

    processTokens(tokens);
  } catch (error) {
    // If marked fails, fall back to regex but log the issue
    console.warn(
      "Failed to parse markdown with marked library, falling back to regex:",
      error.message,
    );
    return extractMarkdownHeadingsFallback(content);
  }

  return headings;
}

// Fallback function using the original regex approach
function extractMarkdownHeadingsFallback(content) {
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
    console.log("  This document has no headings.");
  } else {
    headings.forEach((heading) => {
      console.log(`${heading.prefix} ${heading.text} (H${heading.level})`);
    });
  }
  console.log();
}

async function showDocumentDetail(content, title) {
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    console.log("There's no content to display.");
    return;
  }

  try {
    // Temporarily suppress console.error to hide language warnings
    const originalError = console.error;
    console.error = (message) => {
      // Only suppress cli-highlight language warnings
      if (
        typeof message === "string" &&
        message.toLowerCase().includes("Could not find the language")
      ) {
        return;
      }
      originalError(message);
    };

    marked.setOptions({
      renderer: new markedTerminal(),
    });

    // FIXME: @zhanghan fix error "Could not find the language 'd2', did you forget to load/include a language module?"
    const renderedMarkdown = marked(content);

    // Restore original console.error
    console.error = originalError;

    console.log(`\nDocument: ${title || "Untitled Document"}`);
    console.log("=".repeat(50));
    console.log(renderedMarkdown);
  } catch (_error) {
    console.log("\nFalling back to plain text display (marked-terminal not available):\n");
    console.log(`Document: ${title || "Untitled Document"}`);
    console.log("=".repeat(50));
    console.log(content);
  }
}

export default async function userReviewDocument({ content, description, ...rest }, options) {
  // Check if document content exists
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    console.log("Please provide document content to review.");
    return { content };
  }

  const title = rest.documentStructure?.find((x) => x.path === rest.path)?.title;

  // Print current document headings structure
  if (!rest.isChat) {
    printDocumentHeadings(content, title || "Untitled Document");
  }

  // Initialize shared context with current content
  options.context.userContext.currentContent = content;

  const MAX_ITERATIONS = 100;
  const feedbacks = [];
  let iterationCount = 0;

  let feedback = "";

  while (iterationCount < MAX_ITERATIONS) {
    feedback = "";
    iterationCount++;

    if (rest.isChat && rest.feedback) {
      feedback = rest.feedback;
    } else {
      // Ask user what they want to do
      const action = await options.prompts.select({
        message: "What would you like to do next?",
        choices: [
          {
            name: "View document",
            value: "view",
          },
          {
            name: "Give feedback",
            value: "feedback",
          },
          {
            name: "Done",
            value: "finish",
          },
        ],
      });

      if (action === "finish") {
        break;
      } else if (action === "view") {
        await showDocumentDetail(
          options.context.userContext.currentContent,
          title || "Untitled Document",
        );
      }

      // Ask for feedback
      feedback = await options.prompts.input({
        message:
          "How would you like to improve this document?\n" +
          "Examples:\n" +
          "  • Add troubleshooting section for common errors\n" +
          "  • Simplify the explanation for beginners\n" +
          "  • Remove the outdated information about version 1.0\n\n" +
          "  Your feedback:",
      });

      // If no feedback, finish the loop
      if (!feedback?.trim()) {
        break;
      }

      feedbacks.push(feedback.trim());
    }

    // Get the updateDocument agent
    const updateAgent = options.context.agents["updateSingleDocumentDetail"];
    if (!updateAgent) {
      console.log(
        "We can't process your feedback right now. The document update feature is temporarily unavailable.",
      );
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
        originalContent: options.context.userContext.currentContent,
        feedback: feedback.trim(),
        userPreferences,
        title,
      });
      options.context.userContext.currentContent = result.content;

      // Check if feedback should be saved as user preference
      const feedbackRefinerAgent = options.context.agents["checkFeedbackRefiner"];
      if (feedbackRefinerAgent) {
        try {
          await options.context.invoke(feedbackRefinerAgent, {
            documentContentFeedback: feedback.trim(),
            stage: "document_refine",
          });
        } catch (refinerError) {
          console.warn("We couldn't save your feedback as a preference:", refinerError.message);
          console.warn("Your feedback was applied, but we couldn't save it as a preference.");
        }
      }

      // Print updated document headings structure
      printDocumentHeadings(
        options.context.userContext.currentContent,
        title || "Untitled Document",
      );

      if (rest.isChat) {
        break;
      }
    } catch (error) {
      console.error("Error processing your feedback:");
      console.error(`Type: ${error.name}`);
      console.error(`Message: ${error.message}`);
      if (error.stack) {
        console.error(`Stack: ${error.stack}`);
      }
      console.log("\nPlease try rephrasing your feedback or continue with the current content.");

      process.exit(0);
    }
  }

  return {
    title,
    description,
    ...rest,
    content: options.context.userContext.currentContent,
    feedback: feedbacks.join(". "),
  };
}

userReviewDocument.taskTitle = "User review and modify document content";
