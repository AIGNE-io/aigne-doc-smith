import { readFile } from "node:fs/promises";
import { parse } from "yaml";

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

export function isOpenAPIFile(content) {
  const trimmedContent = content.trim();
  try {
    const parsed = parse(trimmedContent, {
      logLevel: "silent",
    });
    if (parsed.openapi || parsed.swagger) {
      return true;
    }
  } catch {
    //
  }
  try {
    const parsed = JSON.parse(trimmedContent);
    if (parsed.openapi || parsed.swagger) {
      return true;
    }
  } catch {
    //
  }
  return false;
}
