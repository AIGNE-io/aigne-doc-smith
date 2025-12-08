import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export default async function afs_edit(input) {
  const { path, patches } = input;

  if (!patches?.length) {
    throw new Error("No patches provided for afs_edit.");
  }

  if (!path.startsWith('/modules/doc-smith/')) {
    throw new Error(`afs_edit only supports editing files under /modules/doc-smith/, got: ${path}`);
  }

  const realPath = resolve(path.replace('/modules/doc-smith/', '.aigne/doc-smith/'))
  if (!existsSync(realPath)) throw new Error(`File not found: ${realPath}`);

  const originalContent = await readFile(realPath, "utf-8");

  const updatedContent = applyCustomPatches(originalContent, patches);

  await writeFile(realPath, updatedContent, "utf-8");

  return {
    path: input.path,
    message: `Applied ${patches.length} patches to ${input.path}`,
    content: updatedContent,
  }
}

afs_edit.description = `\
Edit a specified file by applying a series of custom patches to its content
`;

afs_edit.input_schema = {
  type: "object",
  properties: {
    path: {
      type: "string",
      description: "The file path to the target file to be edited"
    },
    patches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          start_line: {
            type: "integer",
            description: "The starting line number (0-based) in the original target file where the patch should be applied"
          },
          end_line: {
            type: "integer",
            description: "The ending line number (0-based, exclusive) in the original target file. The range is [start_line, end_line). To insert at line N without deleting, use start_line=N, end_line=N."
          },
          replace: {
            type: "string",
            description: "The new content that will replace the lines from start_line to end_line in the original target file"
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
        A list of unified diff patches to update the target file,
        each patch should be in the format produced by the 'diff' library's createPatch function,
        empty array if no changes are needed.
      `
    }
  },
  required: ["path", "patches"]
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
