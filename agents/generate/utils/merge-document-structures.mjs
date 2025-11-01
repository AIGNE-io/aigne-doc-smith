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

  const structure = options.context.userContext.originalDocumentStructure;

  if (input.add) {
    for (const { index, item } of input.add) {
      if (index != null && index >= 0 && index < structure.length) {
        structure.splice(index, 0, item);
      } else {
        structure.push(item);
      }
    }
  }

  if (input.update) {
    for (const upd of input.update) {
      const idx = structure.findIndex((i) => i.path === upd.path);
      if (idx !== -1) {
        structure[idx] = upd.item;
      }
    }
  }

  if (input.delete) {
    for (const del of input.delete) {
      const idx = structure.findIndex((i) => i.path === del.path);
      if (idx !== -1) {
        structure.splice(idx, 1);
      }
    }
  }

  options.context.userContext.originalDocumentStructure = structure.map((i, index) => {
    delete i.index;

    return {
      index,
      ...i,
    };
  });

  return {};
}
