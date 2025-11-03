import fs from "node:fs";
import { isRemoteFile } from "../../utils/file-utils.mjs";
import { normalizePath, toRelativePath } from "../../utils/utils.mjs";

export default function transformDetailDataSource({ sourceIds }, options = {}) {
  // Read file content for each sourceId, ignoring failures
  let openAPISpec;
  const remoteFileList = options?.context?.userContext?.remoteFileList || [];
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
        if (isRemoteFile(id)) {
          const findFile = remoteFileList.find((f) => f.sourceId === id);
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
    detailDataSource: contents.join(""),
    openAPISpec,
  };
}

transformDetailDataSource.task_render_mode = "hide";
