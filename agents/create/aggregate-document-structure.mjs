import { saveValueToConfig } from "../../utils/utils.mjs";

export default async function aggregateDocumentStructure(input, options) {
  options.context.userContext.originalDocumentStructure ??= [];
  const projectName = input.projectName || options.context.userContext.projectName;
  const projectDesc = input.projectDesc || options.context.userContext.projectDesc;

  if (!input.projectDesc && projectDesc) {
    await saveValueToConfig("projectDesc", projectDesc, "Project description");
  }

  return {
    documentStructure: options.context.userContext.originalDocumentStructure.map((i, index) => ({
      ...i,
      id: i.title.toLowerCase().replace(/\s+/g, "-"),
      index,
    })),
    projectName,
    projectDesc,
  };
}
