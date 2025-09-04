import { stringify } from "yaml";

export default async function formatStructurePlan({ structurePlan, originalStructurePlan }) {
  if (!structurePlan && !originalStructurePlan) {
    throw new Error("Please run 'aigne doc generate' to generate documentation first!");
  }

  // Extract required fields from each item in structurePlan
  const formattedData = (structurePlan || originalStructurePlan)?.map((item) => ({
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
