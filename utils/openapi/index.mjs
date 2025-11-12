import { parse } from "yaml";

function isMatchOpenAPISpec(content) {
  if (!content) return false;
  if (!content.openapi && !content.swagger) return false;
  if (!content.info && !content.info.title && !content.info.version) return false;
  if (!content.paths) return false;
  return true;
}

export function isOpenAPISpecFile(content) {
  const trimmedContent = content.trim();
  try {
    const parsed = parse(trimmedContent, {
      logLevel: "silent",
    });
    return isMatchOpenAPISpec(parsed);
  } catch {
    //
  }
  try {
    const parsed = JSON.parse(trimmedContent);
    return isMatchOpenAPISpec(parsed);
  } catch {
    //
  }
  return false;
}
