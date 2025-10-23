import fs from "node:fs";
import { normalizePath, toRelativePath } from "../../utils/utils.mjs";
import { checkIsHttpFile } from "../../utils/file-utils.mjs";

export default function transformDetailDatasources({ sourceIds }, options) {
  // Read file content for each sourceId, ignoring failures
  let openAPIDoc;
  const httpFileList = options.context?.userContext?.httpFileList || [];
  const contents = (sourceIds || [])
    .filter((id) => {
      if (options.context?.userContext?.openAPIDoc?.sourceId === id) {
        openAPIDoc = options.context.userContext.openAPIDoc;
        return false;
      }
      return true;
    })
    .map((id) => {
      try {
        if (checkIsHttpFile(id)) {
          const findFile = httpFileList.find((f) => f.sourceId === id);
          if (findFile) {
            return `// sourceId: ${id}\n${findFile.content}\n`;
          }
          return null;
        }

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

  return {
    detailDataSources: contents.join(""),
    openAPIDoc,
  };
}

transformDetailDatasources.task_render_mode = "hide";
