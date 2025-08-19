import { normalizePath, toRelativePath } from "../utils/utils.mjs";

export default function transformDetailDatasources({ sourceIds, datasourcesList }) {
  // Build a map for fast lookup, with path normalization for compatibility
  const dsMap = Object.fromEntries(
    (datasourcesList || []).map((ds) => {
      const normalizedSourceId = normalizePath(ds.sourceId);
      return [normalizedSourceId, ds.content];
    }),
  );

  // Collect formatted contents in order, with path normalization
  const contents = (sourceIds || [])
    .filter((id) => {
      const normalizedId = normalizePath(id);
      return dsMap[normalizedId];
    })
    .map((id) => {
      const normalizedId = normalizePath(id);
      const relativeId = toRelativePath(id);
      return `// sourceId: ${relativeId}\n${dsMap[normalizedId]}\n`;
    });

  return { detailDataSources: contents.join("") };
}

transformDetailDatasources.task_render_mode = "hide";
