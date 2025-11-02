export default async function checkGenerateDiagram({needDiagram, documentContent, locale}, options) {
  if (!needDiagram) {
    return {};
  }

  const generateAgent = options.context?.agents?.['generateDiagram'];
  const {diagramSourceCode} = await options.context.invoke(generateAgent, {documentContent, locale});
  const mergeAgent = options.context?.agents?.['mergeDiagramToDocument'];

  const {content} = await options.context.invoke(mergeAgent, {
    diagramSourceCode,
    content: documentContent,
  })
  return {content};
}
