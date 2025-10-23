import { parse } from "yaml";

export function isOpenAPISpecFile(content) {
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
