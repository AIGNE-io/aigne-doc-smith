import path from "node:path";

export default function transformDetailDatasources({
  sourceIds,
  datasourcesList,
}) {
  // Build a map for fast lookup, with path normalization for compatibility
  const dsMap = Object.fromEntries(
    (datasourcesList || []).map((ds) => {
      // Normalize sourceId to absolute path for consistent comparison
      const normalizedSourceId = path.isAbsolute(ds.sourceId)
        ? ds.sourceId
        : path.resolve(process.cwd(), ds.sourceId);
      return [normalizedSourceId, ds.content];
    })
  );

  // Collect formatted contents in order, with path normalization
  const contents = (sourceIds || [])
    .filter((id) => {
      // Normalize sourceId to absolute path for consistent comparison
      const normalizedId = path.isAbsolute(id)
        ? id
        : path.resolve(process.cwd(), id);

      // Check if the normalized path exists in the datasources map
      return dsMap[normalizedId];
    })
    .map((id) => {
      // Normalize sourceId to absolute path for lookup
      const normalizedId = path.isAbsolute(id)
        ? id
        : path.resolve(process.cwd(), id);
      // Convert to relative path for output
      const relativeId = path.isAbsolute(id)
        ? path.relative(process.cwd(), id)
        : id;
      return `// sourceId: ${relativeId}\n${dsMap[normalizedId]}\n`;
    });

  return { detailDataSources: contents.join("") };
}
