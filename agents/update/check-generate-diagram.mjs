export default async function checkGenerateDiagram({needDiagram, documentContent, locale}, options) {
  if (!needDiagram) {
    return {};
  }

  const generateAgent = options.context?.agents?.['generateDiagram'];
  let content = documentContent;

  try {
    const {diagramSourceCode} = await options.context.invoke(generateAgent, {documentContent, locale});
    const mergeAgent = options.context?.agents?.['mergeDiagramToDocument'];

    ({content} = await options.context.invoke(mergeAgent, {
      diagramSourceCode,
      content: documentContent,
    }))
  } catch (error) {
    // If diagram generation fails, just return the original document
    console.log(error.message);
  }
  return {content};
}
