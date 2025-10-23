import fs from "node:fs";
import { normalizePath, toRelativePath } from "../../utils/utils.mjs";
import { checkIsRemoteFile } from "../../utils/file-utils.mjs";

export default function transformDetailDatasources({ sourceIds }, options = {}) {
  // Read file content for each sourceId, ignoring failures
  let openAPISpec;
  const httpFileList = options?.context?.userContext?.httpFileList || [];
  const contents = (sourceIds || [])
    .filter((id) => {
      const openApiSourceId = options?.context?.userContext?.openAPISpec?.sourceId;
      if (openApiSourceId !== undefined && openApiSourceId === id) {
        openAPISpec = options.context.userContext.openAPISpec;
        return false;
      }
      return true;
    })
    .map((id) => {
      try {
        if (checkIsRemoteFile(id)) {
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
    openAPISpec,
  };
}

transformDetailDatasources.task_render_mode = "hide";
