import chalk from "chalk";

import { recordUpdate } from "../../../utils/history-utils.mjs";
/**
 * Print summary of added documents and documents with new links
 */
export default async function printAddDocumentSummary({
  newDocuments = [],
  documentsWithNewLinks = [],
  allFeedback = [],
}) {
  let message = `\n---\n`;
  message += `${chalk.bold.cyan("📊 Summary")}\n\n`;

  // Record the update
  if(allFeedback.length > 0) {
    recordUpdate({
      operation: "structure_update",
      feedback: allFeedback.join("\n"),
    });
  }

  // Display added documents
  if (newDocuments && newDocuments.length > 0) {
    message += `✨ Added Documents:\n`;
    message += `   Total: ${newDocuments.length} document(s)\n\n`;
    newDocuments.forEach((doc, index) => {
      message += `   ${chalk.cyan(`${index + 1}. ${doc.path}`)}`;
      if (doc.title && doc.title !== doc.path) {
        message += ` - ${chalk.yellow(doc.title)}`;
      }
      message += `\n\n`;
    });
  } else {
    message += `✨ Added Documents:\n`;
    message += `${chalk.gray("   No documents were added.\n\n")}`;
  }

  // Display documents with new links
  if (documentsWithNewLinks && documentsWithNewLinks.length > 0) {
    message += `✅ Documents updated (Added new links):\n`;
    message += `   Total: ${documentsWithNewLinks.length} document(s)\n\n`;
    documentsWithNewLinks.forEach((doc, index) => {
      message += `   ${chalk.cyan(`${index + 1}. ${doc.path}`)}`;
      if (doc.title && doc.title !== doc.path) {
        message += ` - ${chalk.yellow(doc.title)}`;
      }
      message += `\n`;
      if (doc.newLinks && doc.newLinks.length > 0) {
        message += `      New links added: ${chalk.gray(doc.newLinks.join(", "))}\n`;
      }
      message += `\n`;
    });
  } else {
    message += `✅ Documents updated (Added new links):\n`;
    message += `${chalk.gray("   No documents needed to be updated.\n\n")}`;
  }

  return { message };
}

printAddDocumentSummary.taskTitle = "Print add document summary";
printAddDocumentSummary.description = "Display summary of added documents";
