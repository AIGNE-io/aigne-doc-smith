import { glob } from "glob";
import { stat } from "node:fs/promises";
import { basename } from "node:path";

/**
 * Generate a sub-structure from provided source paths by invoking a downstream agent.
 * Falls back to empty structure when agent or files are missing.
 */
export default async function generateSubStructure(input, options = {}) {
  const {
    parentDocument,
    subSourcePaths = [],
    includePatterns = ["**/*"],
    excludePatterns = [],
    ...rest
  } = input ?? {};

  // Collect files from provided subSourcePaths (supports files or directories)
  const collected = [];
  for (const entry of subSourcePaths) {
    const entryPath = entry?.path;
    if (!entryPath) continue;
    const stats = await stat(entryPath).catch(() => null);
    if (!stats) continue;

    if (stats.isDirectory()) {
      const matches = await glob(includePatterns, {
        cwd: entryPath,
        nodir: true,
        ignore: excludePatterns,
        absolute: true,
      });
      collected.push(...matches);
    } else {
      collected.push(entryPath);
    }
  }

  const fallbackPaths = subSourcePaths.map((x) => x?.path).filter(Boolean);
  const files = Array.from(new Set(collected.length > 0 ? collected : fallbackPaths));
  const allFilesPaths = Array.from(
    new Set([
      ...files.map((f) => basename(f)).filter(Boolean),
      ...subSourcePaths.map((x) => basename(x?.path || "")).filter(Boolean),
    ]),
  );

  const agent = options?.context?.agents?.generateStructureWithoutTools;
  const invoke = options?.context?.invoke;

  let subStructure = [];
  if (agent && invoke) {
    const result = await invoke(agent, {
      parentDocument,
      files,
      allFilesPaths,
      includePatterns,
      excludePatterns,
      ...rest,
    });
    subStructure = Array.isArray(result?.documentStructure) ? result.documentStructure : [];
  }

  return {
    subStructure,
    files,
    allFilesPaths,
  };
}

generateSubStructure.taskTitle = "Generate sub structure";
