import fs from "node:fs";
import { normalizePath, toRelativePath } from "../../utils/utils.mjs";

export default function transformDetailDatasources({ sourceIds }) {
  // Read file content for each sourceId, ignoring failures
  const contents = (sourceIds || [])
    .map((id) => {
      try {
        const normalizedId = normalizePath(id);
        const content = fs.readFileSync(normalizedId, "utf8");
        const relativeId = toRelativePath(id);
        return `// sourceId: ${relativeId}\n${content}\n`;
      } catch {
        // Ignore files that cannot be read
        return null;
      }
    })
    .filter(Boolean);

  return { detailDataSources: contents.join("") };
}

transformDetailDatasources.task_render_mode = "hide";
