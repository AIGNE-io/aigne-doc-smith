import { stringify } from "yaml";

export default async function formatStructurePlan({ structurePlan }) {
  // Extract required fields from each item in structurePlan
  const formattedData = structurePlan.map((item) => ({
    title: item.title,
    path: item.path,
    parentId: item.parentId,
    description: item.description,
  }));

  // Convert to YAML string
  const yamlString = stringify(formattedData, {
    indent: 2,
    lineWidth: 120,
    minContentWidth: 20,
  });

  return {
    structurePlanYaml: yamlString,
    structurePlan,
  };
}

formatStructurePlan.task_render_mode = "hide";
