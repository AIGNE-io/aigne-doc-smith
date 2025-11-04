const placeholder = "DIAGRAM_PLACEHOLDER";

export default async function checkGenerateDiagram(
  { needDiagram, documentContent, locale },
  options,
) {
  if (!needDiagram) {
    return {};
  }

  const generateAgent = options.context?.agents?.["generateDiagram"];
  let content = documentContent;

  if (content.includes(placeholder)) {
    try {
      const { diagramSourceCode } = await options.context.invoke(generateAgent, {
        documentContent,
        locale,
      });
      content = content.replace(placeholder, diagramSourceCode);
    } catch (error) {
      // FIXME: @zhanghan should regenerate document without diagram
      content = content.replace(placeholder, "");
      console.log(`⚠️  Skip generate any diagram: ${error.message}`);
    }
  }

  return { content };
}
