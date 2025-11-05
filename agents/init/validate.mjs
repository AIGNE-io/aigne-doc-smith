import path from "node:path";
export function validateDocDir(input) {
  const currentDir = process.cwd();
  const targetDir = path.resolve(input);
  const relativePath = path.relative(currentDir, targetDir);
  if (relativePath.length === 0) {
    return `Can't use current directory: ${targetDir}`;
  }
  if (relativePath.startsWith("..")) {
    return `Can't use directory outside current directory: ${targetDir}`;
  }
  if (path.isAbsolute(relativePath)) {
    return `Can't use absolute path: ${targetDir}`;
  }
  return true;
}
