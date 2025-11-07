const PLACEHOLDER = "DIAGRAM_PLACEHOLDER";
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
  let diagramSourceCode;
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
      ({ diagramSourceCode } = await options.context.invoke(generateAgent, {
        documentContent: content,
        locale,
      }));
    } catch (error) {
      diagramSourceCode = "";
      skipGenerateDiagram = true;
      console.log(`⚠️  Skip generate any diagram for ${docPath}: ${error.message}`);
    }

    if (diagramSourceCode && !skipGenerateDiagram) {
      if (content.includes(PLACEHOLDER)) {
        content = content.replace(PLACEHOLDER, diagramSourceCode);
      } else {
        const mergeAgent = options.context?.agents?.["mergeDiagramToDocument"];
        ({ content } = await options.context.invoke(mergeAgent, {
          diagramSourceCode,
          content,
        }));
      }
    } else {
      content = documentContent;
    }
  }

  return { content };
}
