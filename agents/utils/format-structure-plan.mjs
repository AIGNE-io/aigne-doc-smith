import { stringify } from "yaml";

export default async function formatStructurePlan({ documentStructure }) {
  // Extract required fields from each item in documentStructure
  const formattedData = documentStructure.map((item) => ({
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
    documentStructureYaml: yamlString,
    documentStructure,
  };
}

formatStructurePlan.task_render_mode = "hide";
