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
    path: docPath,
    diagramming,
  },
  options,
) {
  let content = documentContent;
  let skipGenerateDiagram = false;

  const preCheckAgent = options.context?.agents?.["preCheckGenerateDiagram"];

  const preCheckResult = await options.context.invoke(preCheckAgent, {
    documentContent,
    feedback,
    detailFeedback,
    previousGenerationContent: originalContent,
  });

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

  if (totalScore <= diagrammingEffort) {
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
      console.log(`⚠️  Skip generate any diagram for ${docPath}: ${error.message}`);
      // On error, return original document content
      content = documentContent;
    }
  }

  return { content };
}
