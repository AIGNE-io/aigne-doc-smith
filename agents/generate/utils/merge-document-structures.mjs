export default async function mergeDocumentStructures(input, options) {
  if (input.projectName) {
    options.context.userContext.projectName = input.projectName;
  }
  if (input.projectDesc) {
    options.context.userContext.projectDesc = input.projectDesc;
  }

  input.projectName = options.context.userContext.projectName;
  input.projectDesc = options.context.userContext.projectDesc;

  options.context.userContext.originalDocumentStructure ??= [];

  const originalStructures = [...options.context.userContext.originalDocumentStructure];

  if (input.structures) {
    for (const item of input.structures) {
      const index = originalStructures.findIndex((s) => s.path === item.path);
      if (index !== -1) {
        originalStructures[index] = item;
      } else {
        originalStructures.push(item);
      }
    }
  }

  options.context.userContext.originalDocumentStructure = originalStructures;

  return {};
}
