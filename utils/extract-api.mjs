import { readFile } from "node:fs/promises";
import { transpileDeclaration } from "typescript";

export async function extractApi(path) {
  const content = await readFile(path, "utf8");

  const lang = languages.find((lang) => lang.match(path, content));
  if (lang) {
    return lang.extract(path, content);
  }

  return content;
}

const languages = [
  {
    match: (path) => /\.m?(js|ts)x?$/.test(path),
    extract: extractJsApi,
  },
];

async function extractJsApi(_path, content) {
  const res = transpileDeclaration(content, {
    compilerOptions: {
      declaration: true,
      emitDeclarationOnly: true,
      allowJs: true,
    },
  });

  return res.outputText.trim();
}
