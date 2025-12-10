import { buildAllowedLinksFromStructure } from "../../utils/docs-finder-utils.mjs";
import { checkMarkdown } from "../../utils/markdown-checker.mjs";

export default async function checkDetailResult({
  documentStructure,
  reviewContent,
  docsDir,
  isApproved: preApproved,
}) {
  // If already approved (e.g., --diagram mode), skip validation
  if (preApproved === true) {
    return {
      isApproved: true,
      detailFeedback: "",
    };
  }

  if (!reviewContent || reviewContent.trim() === "") {
    return {
      isApproved: false,
      detailFeedback: "Review content is empty",
    };
  }

  let isApproved = true;
  const detailFeedback = [];

  // Create a set of allowed links, including both original paths and processed .md paths
  const allowedLinks = buildAllowedLinksFromStructure(documentStructure);

  // Run comprehensive markdown validation with all checks
  try {
    const markdownErrors = await checkMarkdown(reviewContent, "result", {
      allowedLinks,
      baseDir: docsDir,
    });

    if (markdownErrors.length > 0) {
      isApproved = false;
      detailFeedback.push(...markdownErrors);
    }
  } catch (error) {
    isApproved = false;
    detailFeedback.push(`Found markdown validation error in result: ${error.message}`);
  }

  return {
    isApproved,
    detailFeedback: detailFeedback.join("\n"),
  };
}
