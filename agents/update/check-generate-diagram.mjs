import { hasDiagramContent } from "../../utils/check-document-has-diagram.mjs";

const DEFAULT_DIAGRAMMING_EFFORT = 5;
const MIN_DIAGRAMMING_EFFORT = 0;
const MAX_DIAGRAMMING_EFFORT = 10;

export default async function checkGenerateDiagram(
  {
    documentContent,
    locale,
    feedback,
    detailFeedback,
    originalContent,
    diagramming,
    path,
    docsDir,
    shouldUpdateDiagrams,
  },
  options,
) {
  let content = documentContent;
  let skipGenerateDiagram = false;

  // If --diagram flag is set and document already has d2 code blocks,
  // skip preCheck and directly replace existing diagrams
  // This is because when using --diagram/--diagram-all, the user explicitly wants to update diagrams,
  // so we should skip the "do we need to generate diagram" check and directly proceed to replacement
  const hasExistingDiagrams = originalContent && hasDiagramContent(originalContent);

  // Skip preCheck if:
  // 1. Using --diagram/--diagram-all flag (shouldUpdateDiagrams === true) AND
  // 2. Document already has d2 code blocks (hasExistingDiagrams === true)
  // This means user explicitly wants to update existing diagrams, no need to check if diagram is needed
  const shouldSkipPreCheck = shouldUpdateDiagrams === true && hasExistingDiagrams;

  let preCheckResult = { details: [], content: null };
  if (!shouldSkipPreCheck) {
    const preCheckAgent = options.context?.agents?.["preCheckGenerateDiagram"];

    preCheckResult = await options.context.invoke(preCheckAgent, {
      documentContent,
      feedback,
      detailFeedback,
      previousGenerationContent: originalContent,
    });
  }

  const totalScore = (preCheckResult.details || []).reduce((acc, curr) => acc + curr.score, 0);
  if (![false, "false", "", undefined, null].includes(preCheckResult.content)) {
    content = preCheckResult.content;
  }

  let diagrammingEffort = diagramming?.effort
    ? Number(diagramming?.effort)
    : DEFAULT_DIAGRAMMING_EFFORT;

  if (Number.isNaN(diagrammingEffort)) {
    diagrammingEffort = DEFAULT_DIAGRAMMING_EFFORT;
  } else {
    diagrammingEffort = Math.min(
      Math.max(MIN_DIAGRAMMING_EFFORT, diagrammingEffort),
      MAX_DIAGRAMMING_EFFORT,
    );
  }

  // If we skipped preCheck because document has existing diagrams and --diagram flag is set,
  // we should NOT skip generating diagram (we need to replace existing ones)
  if (shouldSkipPreCheck) {
    skipGenerateDiagram = false;
  } else if (totalScore <= diagrammingEffort) {
    skipGenerateDiagram = true;
  }

  if (skipGenerateDiagram) {
    content = documentContent;
  } else {
    try {
      const generateAgent = options.context?.agents?.["generateDiagram"];
      const result = await options.context.invoke(generateAgent, {
        documentContent: content,
        locale,
        diagramming: diagramming || {},
        feedback: feedback || "",
        originalContent: originalContent || documentContent,
        path,
        docsDir,
      });

      // generateDiagram now returns { content } with image already inserted
      // The image replaces DIAGRAM_PLACEHOLDER or D2 code blocks
      if (result?.content) {
        content = result.content;
      } else {
        // Fallback: if no content returned, use original document content
        content = documentContent;
      }
    } catch (error) {
      skipGenerateDiagram = true;
      console.log(`⚠️  Skip generate any diagram: ${error.message}`);
      // On error, return original document content
      content = documentContent;
    }
  }

  return { content };
}
