import chalk from "chalk";

/**
 * Print summary of removed documents and documents with invalid links
 */
export default async function printRemoveDocumentSummary({
  deletedDocuments = [],
  documentsWithInvalidLinks = [],
}) {
  let message = `\n${"=".repeat(80)}\n`;
  message += `${chalk.bold.cyan("📊 Summary")}\n`;
  message += `${"=".repeat(80)}\n\n`;

  // Display removed documents
  if (deletedDocuments && deletedDocuments.length > 0) {
    message += `🗑️  Removed Documents:\n`;
    message += `   Total: ${deletedDocuments.length} document(s)\n\n`;
    deletedDocuments.forEach((doc, index) => {
      message += `   ${chalk.cyan(`${index + 1}. ${doc.path}`)}`;
      if (doc.title && doc.title !== doc.path) {
        message += ` - ${chalk.yellow(doc.title)}`;
      }
      message += `\n\n`;
    });
  } else {
    message += `🗑️  Removed Documents:\n`;
    message += `${chalk.gray("   No documents were removed.\n\n")}`;
  }

  // Display documents with invalid links
  if (documentsWithInvalidLinks && documentsWithInvalidLinks.length > 0) {
    message += `✅ Documents fixed (Removed invalid links):\n`;
    message += `   Total: ${documentsWithInvalidLinks.length} document(s)\n\n`;
    documentsWithInvalidLinks.forEach((doc, index) => {
      message += `   ${chalk.cyan(`${index + 1}. ${doc.path}`)}`;
      if (doc.title && doc.title !== doc.path) {
        message += ` - ${chalk.yellow(doc.title)}`;
      }
      message += `\n`;
      if (doc.invalidLinks && doc.invalidLinks.length > 0) {
        message += `      Invalid links fixed: ${chalk.gray(doc.invalidLinks.join(", "))}\n`;
      }
      message += `\n`;
    });
  } else {
    message += `✅ Documents fixed (Removed invalid links):\n`;
    message += `${chalk.gray("   No documents needed to be fixed.\n\n")}`;
  }

  message += `${"=".repeat(80)}\n\n`;

  return { message };
}

printRemoveDocumentSummary.taskTitle = "Print remove document summary";
printRemoveDocumentSummary.description = "Display summary of removed documents";
