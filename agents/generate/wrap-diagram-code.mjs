import { wrapCode } from "../../utils/d2-utils.mjs";

export default async function wrapDiagramCode({ d2SourceCode }) {
  try {
    const result = await wrapCode({ content: d2SourceCode });
    return {
      d2SourceCode: result,
    };
  } catch {
    return {
      d2SourceCode
    };
  }
}

wrapDiagramCode.input_schema = {
  type: "object",
  properties: {
    d2SourceCode: {
      type: "string",
      description: "Source code of d2 diagram",
    },
  },
  required: ["d2SourceCode"],
};
wrapDiagramCode.output_schema = {
  type: "object",
  properties: {
    d2SourceCode: {
      type: "string",
      description: "Source code of d2 diagram",
    },
  },
  required: ["d2SourceCode"],
};
