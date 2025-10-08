import { wrapCode } from "../../utils/d2-utils.mjs";

export default async function wrapDiagramCode({ diagramSourceCode }) {
  try {
    const result = await wrapCode({ content: diagramSourceCode });
    return {
      diagramSourceCode: result,
    };
  } catch {
    return {
      diagramSourceCode
    };
  }
}

wrapDiagramCode.input_schema = {
  type: "object",
  properties: {
    diagramSourceCode: {
      type: "string",
      description: "Source code of d2 diagram",
    },
  },
  required: ["diagramSourceCode"],
};
wrapDiagramCode.output_schema = {
  type: "object",
  properties: {
    diagramSourceCode: {
      type: "string",
      description: "Source code of d2 diagram",
    },
  },
  required: ["diagramSourceCode"],
};
