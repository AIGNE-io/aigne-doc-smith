import { checkContent } from "../../utils/d2-utils.mjs";

export default async function checkD2DiagramIsValid({ d2DiagramSourceCode }) {
  try {
    await checkContent({ content: d2DiagramSourceCode });
    return {
      isValid: true,
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message,
    };
  }
}

checkD2DiagramIsValid.input_schema = {
  type: "object",
  properties: {
    d2DiagramSourceCode: {
      type: "string",
      description: "Source code of d2 diagram",
    },
  },
  required: ["d2DiagramSourceCode"],
};
