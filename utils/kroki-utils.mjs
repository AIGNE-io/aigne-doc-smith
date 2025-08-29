import fs from "node:fs/promises";
import path from "node:path";
import { joinURL } from "ufo";
import { glob } from "glob";
import pMap from "p-map";

import { D2_CONFIG, KROKI_CONCURRENCY, FILE_CONCURRENCY } from "./constants.mjs";

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

// Helper: extract d2 code blocks
function extractD2Blocks(markdown) {
  if (!markdown) return [];
  const regex = /```d2\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

// Helper: save d2 svg assets alongside document
export async function saveD2Assets({ markdown, baseName, docsDir }) {
  try {
    const { getD2Svg } = await import("./kroki-utils.mjs");
    const d2Blocks = extractD2Blocks(markdown);
    if (!d2Blocks.length) return [];

    const assetDir = path.join(docsDir, "assets", baseName);
    await fs.mkdir(assetDir, { recursive: true });

    const saved = [];
    await pMap(
      d2Blocks,
      async (d2Block, index) => {
        const d2Content = [D2_CONFIG, d2Block].join("\n");
        const svgPath = path.join(assetDir, `d2-${index + 1}.svg`);
        try {
          const svg = await getD2Svg({ content: d2Content });
          if (svg) {
            await fs.writeFile(svgPath, svg, "utf8");
            saved.push({ path: svgPath, success: true, index });
          }
        } catch (e) {
          saved.push({ path: svgPath, success: false, error: e.message, index });
        }
      },
      { concurrency: KROKI_CONCURRENCY },
    );
    return saved;
  } catch (e) {
    return [{ path: path.join(docsDir, "assets", baseName), success: false, error: e.message }];
  }
}

// Helper: append image refs after each d2 block if missing
export function appendD2ImageRefs(markdown, baseName) {
  if (!markdown) return markdown;
  const codeBlockRegex = /```d2\n([\s\S]*?)```/g;
  let blockIndex = 1;
  // Replace d2 code blocks with img tags (without preserving d2 content)
  const replaced = markdown.replace(codeBlockRegex, (_match, _code) => {
    return `![](./assets/${baseName}/d2-${blockIndex++}.svg)`;
  });
  return replaced;
}

export async function beforePublishHook({ docsDir }) {
  // Example: process each markdown file (replace with your logic)
  const mdFilePaths = await glob("**/*.md", { cwd: docsDir });
  await pMap(
    mdFilePaths,
    async (filePath) => {
      let finalContent = await fs.readFile(path.join(docsDir, filePath), "utf8");
      const docPath = filePath.replace(docsDir, "").replace(".md", "");
      const flatName = docPath.replace(/^\//, "").replace(/\//g, "-");
      await saveD2Assets({ markdown: finalContent, baseName: flatName, docsDir });
      finalContent = appendD2ImageRefs(finalContent, flatName);
      await fs.writeFile(path.join(docsDir, filePath), finalContent, "utf8");
    },
    { concurrency: FILE_CONCURRENCY },
  );
}
