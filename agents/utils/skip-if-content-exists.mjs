/**
 * Determine whether to skip document generation when the document already exists.
 * If intentType is diagram-related *and* content is already present, mark that
 * generation should be skipped so downstream agents can short-circuit.
 */
export default async function skipIfContentExists(input) {
  const { intentType, content } = input;

  const isDiagramIntent = intentType && ["addDiagram", "updateDiagram", "deleteDiagram"].includes(intentType);
  const shouldSkipGeneration = Boolean(isDiagramIntent && content);

  return {
    ...input,
    skipGenerateDocument: shouldSkipGeneration,
    // Ensure downstream steps have content available when skipping
    ...(shouldSkipGeneration
      ? {
          content,
          documentContent: content,
          originalContent: content,
        }
      : {}),
  };
}

skipIfContentExists.task_render_mode = "hide";
