export default async function applyDiff(input, options) {
  const { writeFile, mkdir } = await import("node:fs/promises");

  const originalStructure = options.context.userContext.documentStructure || '';
  const { patches } = input;

  if (!patches?.length) {
    return {
      documentStructure: originalStructure,
    }
  }

  const updatedStructure = applyCustomPatches(originalStructure, patches);

  options.context.userContext.documentStructure = updatedStructure;
  options.context.userContext.documentStructureWithLines = updatedStructure.split("\n")
    .map((line, index) => `${index}: ${line}`).join("\n");

  await mkdir("./.aigne/doc-smith/output", { recursive: true });
  await writeFile("./.aigne/doc-smith/output/document_structure.yaml", updatedStructure, "utf-8");

  return {
    documentStructure: updatedStructure,
  };
}

applyDiff.description = `
  Applies a series of custom patches to the document_structure.yaml content
  to update the document structure based on the provided patches.
`;

applyDiff.input_schema = {
  type: "object",
  properties: {
    patches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start_line: {
            type: "integer",
            description: "The starting line number (0-based) in the original document_structure.yaml where the patch should be applied"
          },
          end_line: {
            type: "integer",
            description: "The ending line number (0-based, exclusive) in the original document_structure.yaml. The range is [start_line, end_line). To insert at line N without deleting, use start_line=N, end_line=N."
          },
          replace: {
            type: "string",
            description: "The new content that will replace the lines from start_line to end_line in the original document_structure.yaml"
          },
          delete: {
            type: "boolean",
            description: "Indicates whether the specified lines should be deleted (true) or replaced (false)"
          }
        },
        required: ["start_line", "end_line", "delete"]
      },
      minItems: 1,
      description: `
        A list of unified diff patches to update the document structure,
        each patch should be in the format produced by the 'diff' library's createPatch function,
        empty array if no changes are needed.
      `
    }
  }
}

export function applyCustomPatches(text, patches) {
  // 按 start_line 升序是链式 patch 通用方式
  const sorted = [...patches].sort((a, b) => a.start_line - b.start_line);
  const lines = text.split("\n");

  for (let i = 0; i < sorted.length; i++) {
    const patch = sorted[i];

    const start = patch.start_line;
    const end = patch.end_line;
    const deleteCount = end - start; // [start, end) range

    let delta = 0;

    if (patch.delete) {
      // Delete mode: remove the specified lines [start, end)
      lines.splice(start, deleteCount);
      delta = -deleteCount;
    } else {
      // Replace mode: replace the specified lines with new content
      const replaceLines = patch.replace ? patch.replace.split("\n") : [];
      lines.splice(start, deleteCount, ...replaceLines);
      delta = replaceLines.length - deleteCount;
    }

    // 更新后续 patch 行号偏移
    // For exclusive-end semantics [start, end), we adjust patches that start >= current patch's start_line
    // after the current patch has been applied
    if (delta !== 0) {
      for (let j = i + 1; j < sorted.length; j++) {
        const next = sorted[j];
        // Adjust patches that start at or after the current patch's end line
        if (next.start_line >= patch.end_line) {
          next.start_line += delta;
          next.end_line += delta;
        }
      }
    }
  }

  return lines.join("\n");
}
