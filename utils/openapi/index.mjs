import { readFile } from "node:fs/promises";

export async function getOpenAPIContent(file) {
  if (!file) return null;
  try {
    if (file.startsWith("http://") || file.startsWith("https://")) {
      const res = await fetch(file);
      const text = await res.text();
      return text;
    }
    const result = await readFile(file, "utf8");
    return result;
  } catch {
    return null;
  }
}
