import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default async function loadBaseSources() {
  const cwd = process.cwd();
  const docSmithPath = join(cwd, ".aigne/doc-smith");
  const structureFilePath = join(docSmithPath, "output/document_structure.yaml");

  // 读取 document_structure.yaml 文件内容
  let structureContent = "";
  try {
    structureContent = await readFile(structureFilePath, "utf-8");
  } catch {
    // 文件不存在时忽略错误
  }

  return {
    structureContent,
  };
}
