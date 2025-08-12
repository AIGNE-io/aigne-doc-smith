import fs from "node:fs/promises";
import path from "node:path";

const structureDir = path.join(
  process.cwd(),
  "./.aigne/doc-smith",
  "output",
  "structure-plan.json",
);

export default async function getDocsStructure() {
  const structure = await fs.readFile(structureDir, "utf-8");
  return { structure };
}

getDocsStructure.description = "Get docs structure";
