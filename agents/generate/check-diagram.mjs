import { checkContent } from "../../utils/d2-utils.mjs";

export default async function checkD2DiagramIsValid({ output }) {
  try {
    await checkContent({ content: output });
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
    output: {
      type: "string",
      description: "Source code of d2 diagram",
    },
  },
  required: ["output"],
};
checkD2DiagramIsValid.output_schema = {
  type: "object",
  properties: {
    isValid: {
      type: "boolean",
      description: "Indicates whether the provided d2 diagram source passes validation",
    },
    error: {
      type: "string",
      description: "Validation error details when the diagram does not pass",
    },
  },
  required: ["isValid"],
};
