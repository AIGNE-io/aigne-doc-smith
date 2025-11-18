export default function addTranslatesToStructure({
  originalDocumentStructure = [],
  translateLanguages = [],
}) {
  const documentExecutionStructure = (originalDocumentStructure || []).map((item) => ({
    ...item,
    translates: (translateLanguages || []).map((lang) => ({ language: lang })),
  }));

  return {
    documentExecutionStructure,
  };
}

addTranslatesToStructure.inputSchema = {
  type: "object",
  properties: {
    originalDocumentStructure: { type: "array", items: { type: "object" } },
    translateLanguages: { type: "array", items: { type: "string" } },
  },
  required: ["originalDocumentStructure", "translateLanguages"],
};
addTranslatesToStructure.outputSchema = {
  type: "object",
  properties: {
    documentExecutionStructure: { type: "array" },
  },
};
addTranslatesToStructure.task_render_mode = "hide";
