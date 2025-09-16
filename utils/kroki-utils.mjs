import path from "node:path";

import Debug from "debug";
import fs from "fs-extra";
import { glob } from "glob";
import pMap from "p-map";
import { joinURL } from "ufo";

import {
  D2_CONFIG,
  DOC_SMITH_DIR,
  FILE_CONCURRENCY,
  KROKI_CONCURRENCY,
  TMP_ASSETS_DIR,
  TMP_DIR,
} from "./constants/index.mjs";
import { getContentHash } from "./utils.mjs";

const debug = Debug("doc-smith");

export async function getChart({ chart = "d2", format = "svg", content, strict }) {
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
    if (strict && !res.ok) {
      throw new Error(`Failed to fetch chart: ${res.status} ${res.statusText}`);
    }

    const data = await res.text();
    return data;
  } catch (err) {
    if (strict) throw err;

    console.error("Failed to generate chart from:", baseUrl, err);
    return null;
  }
}

export async function getD2Svg({ content, strict = false }) {
  const svgContent = await getChart({
    chart: "d2",
    format: "svg",
    content,
    strict,
  });
  return svgContent;
}

// Helper: save d2 svg assets alongside document
export async function saveD2Assets({ markdown, docsDir }) {
  if (!markdown) {
    return markdown;
  }

  const codeBlockRegex = /```d2.*\n([\s\S]*?)```/g;

  const { replaced } = await runIterator({
    input: markdown,
    regexp: codeBlockRegex,
    replace: true,
    fn: async ([_match, _code]) => {
      const assetDir = path.join(docsDir, "../", TMP_ASSETS_DIR, "d2");
      await fs.ensureDir(assetDir);
      const d2Content = [D2_CONFIG, _code].join("\n");
      const fileName = `${getContentHash(d2Content)}.svg`;
      const svgPath = path.join(assetDir, fileName);

      if (await fs.pathExists(svgPath)) {
        debug("Found assets cache, skipping generation", svgPath);
      } else {
        try {
          debug("start generate d2 chart", svgPath);
          if (debug.enabled) {
            const d2FileName = `${getContentHash(d2Content)}.d2`;
            const d2Path = path.join(assetDir, d2FileName);
            await fs.writeFile(d2Path, d2Content, { encoding: "utf8" });
          }

          const svg = await getD2Svg({ content: d2Content });
          if (svg) {
            await fs.writeFile(svgPath, svg, { encoding: "utf8" });
          }
        } catch (error) {
          debug("Failed to generate D2 chart:", error);
          return _code;
        }
      }
      return `![](${path.posix.join("..", TMP_ASSETS_DIR, "d2", fileName)})`;
    },
    options: { concurrency: KROKI_CONCURRENCY },
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

async function runIterator({ input, regexp, fn = () => {}, options, replace = false }) {
  if (!input) return input;
  const matches = [...input.matchAll(regexp)];
  const results = [];
  await pMap(
    matches,
    async (...args) => {
      const resultItem = await fn(...args);
      results.push(resultItem);
    },
    options,
  );

  let replaced = input;
  if (replace) {
    let index = 0;
    replaced = replaced.replace(regexp, () => {
      return results[index++];
    });
  }

  return {
    results,
    replaced,
  };
}

export async function checkD2Content({ content }) {
  await ensureTmpDir();
  const assetDir = path.join(DOC_SMITH_DIR, TMP_DIR, TMP_ASSETS_DIR, "d2");
  await fs.ensureDir(assetDir);
  const d2Content = [D2_CONFIG, content].join("\n");
  const fileName = `${getContentHash(d2Content)}.svg`;
  const svgPath = path.join(assetDir, fileName);

  if (debug.enabled) {
    const d2FileName = `${getContentHash(d2Content)}.d2`;
    const d2Path = path.join(assetDir, d2FileName);
    await fs.writeFile(d2Path, d2Content, { encoding: "utf8" });
  }

  if (await fs.pathExists(svgPath)) {
    debug("Found assets cache, skipping generation", svgPath);
    return;
  }

  const svg = await getD2Svg({ content: d2Content, strict: true });
  await fs.writeFile(svgPath, svg, { encoding: "utf8" });
}

export async function ensureTmpDir() {
  const tmpDir = path.join(DOC_SMITH_DIR, TMP_DIR);
  if (!(await fs.pathExists(path.join(tmpDir, ".gitignore")))) {
    await fs.ensureDir(tmpDir);
    await fs.writeFile(path.join(tmpDir, ".gitignore"), "**/*", { encoding: "utf8" });
  }
}
