import path from "node:path";

import fs from "fs-extra";
import { joinURL } from "ufo";
import { glob } from "glob";
import pMap from "p-map";

import { D2_CONFIG, FILE_CONCURRENCY, KROKI_CONCURRENCY, TMP_ASSETS_DIR } from "./constants.mjs";
import { getContentHash } from "./utils.mjs";

export async function getChart({ chart = "d2", format = "svg", content }) {
  const baseUrl = "https://chart.abtnet.io";

  try {
    const res = await fetch(joinURL(baseUrl, chart, format), {
      method: "POST",
      body: content,
      headers: {
        Accept: "image/svg+xml",
        "Content-Type": "text/plain",
      },
    });
    const data = await res.text();
    return data;
  } catch (err) {
    console.error("Failed to generate chart from:", baseUrl, err);
    return null;
  }
}

export async function getD2Svg({ content }) {
  const svgContent = await getChart({
    chart: "d2",
    format: "svg",
    content,
  });
  return svgContent;
}

// Helper: save d2 svg assets alongside document
export async function saveD2Assets({ markdown, docsDir }) {
  if (!markdown) return markdown;
  const codeBlockRegex = /```d2\n([\s\S]*?)```/g;
  const matches = [...markdown.matchAll(codeBlockRegex)];

  const results = [];
  await pMap(
    matches,
    async ([_match, _code]) => {
      const assetDir = path.join(docsDir, "../", TMP_ASSETS_DIR, "d2");
      await fs.ensureDir(assetDir);
      const d2Content = [D2_CONFIG, _code].join("\n");
      const fileName = `${getContentHash(d2Content)}.svg`;
      const svgPath = path.join(assetDir, fileName);

      if (await fs.pathExists(svgPath)) {
        console.log({ svgPath, fileName });
      } else {
        console.log("staring convert", svgPath);
        try {
          const svg = await getD2Svg({ content: d2Content });
          if (svg) {
            await fs.writeFile(svgPath, svg, { encoding: "utf8" });
          }
        } catch {
          results.push(_code);
        }
      }
      results.push(`![](../${TMP_ASSETS_DIR}/d2/${fileName})`);
    },
    { concurrency: KROKI_CONCURRENCY },
  );

  let index = 0;
  // Replace d2 code blocks with img tags (without preserving d2 content)
  const replaced = markdown.replace(codeBlockRegex, () => {
    return results[index++];
  });
  return replaced;
}

export async function beforePublishHook({ docsDir }) {
  // Example: process each markdown file (replace with your logic)
  const mdFilePaths = await glob("**/*.md", { cwd: docsDir });
  await pMap(
    mdFilePaths,
    async (filePath) => {
      let finalContent = await fs.readFile(path.join(docsDir, filePath), { encoding: "utf8" });
      finalContent = await saveD2Assets({ markdown: finalContent, docsDir });

      await fs.writeFile(path.join(docsDir, filePath), finalContent, { encoding: "utf8" });
    },
    { concurrency: FILE_CONCURRENCY },
  );
}
