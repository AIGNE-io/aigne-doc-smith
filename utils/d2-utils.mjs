import path from "node:path";

import { D2 } from "@terrastruct/d2";
import fs from "fs-extra";
import { glob } from "glob";
import pMap from "p-map";

import {
  D2_CONCURRENCY,
  D2_CONFIG,
  DOC_SMITH_DIR,
  FILE_CONCURRENCY,
  TMP_ASSETS_DIR,
  TMP_DIR,
} from "./constants/index.mjs";
import { debug } from "./debug.mjs";
import { iconMap } from "./icon-map.mjs";
import { getContentHash } from "./utils.mjs";

const codeBlockRegex = /```d2.*\n([\s\S]*?)```/g;

export const DIAGRAM_PLACEHOLDER = "DIAGRAM_PLACEHOLDER";

export async function getChart({ content, strict }) {
  const d2 = new D2();
  const iconUrlList = Object.keys(iconMap);
  const escapedUrls = iconUrlList.map((url) => url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regexPattern = escapedUrls.join("|");
  const regex = new RegExp(regexPattern, "g");

  const contentWithBase64Img = content.replace(regex, (match) => {
    return iconMap[match];
  });
  try {
    const { diagram, renderOptions, graph } = await d2.compile(contentWithBase64Img);

    // Do not apply a stroke-dash to sequence diagrams.
    if (
      graph?.root?.attributes?.shape &&
      graph.root.attributes.shape.value !== "sequence_diagram"
    ) {
      // Save the first-level container.
      const firstLevelContainer = new Set();
      diagram.shapes.forEach((x) => {
        const idList = x.id.split(".");
        if (idList.length > 1) {
          const targetShape = diagram.shapes.find((x) => x.id === idList[0]);
          if (targetShape && !["c4-person", "cylinder", "queue"].includes(targetShape.type)) {
            firstLevelContainer.add(targetShape);
          }
        }
      });
      firstLevelContainer.forEach((shape) => {
        if (!shape.strokeDash) {
          // Note: The data structure here is different from the d2 source code.
          shape.strokeDash = 3;
        }
      });
    }

    const svg = await d2.render(diagram, renderOptions);

    return svg;
  } catch (err) {
    if (strict) throw err;

    console.error("Failed to generate D2 diagram. Content:", content, "Error:", err);
    return null;
  } finally {
    d2.worker.terminate();
  }
}

export async function saveAssets({ markdown, docsDir }) {
  if (!markdown) {
    return markdown;
  }

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
        debug("Asset cache found, skipping generation", svgPath);
      } else {
        try {
          debug("Generating d2 diagram", svgPath);
          if (debug.enabled) {
            const d2FileName = `${getContentHash(d2Content)}.d2`;
            const d2Path = path.join(assetDir, d2FileName);
            await fs.writeFile(d2Path, d2Content, { encoding: "utf8" });
          }

          const svg = await getChart({ content: d2Content });
          if (svg) {
            await fs.writeFile(svgPath, svg, { encoding: "utf8" });
          }
        } catch (error) {
          debug("Failed to generate D2 diagram. Content:", d2Content, "Error:", error);
          return _code;
        }
      }
      return `![](${path.posix.join("..", TMP_ASSETS_DIR, "d2", fileName)})`;
    },
    options: { concurrency: D2_CONCURRENCY },
  });

  return replaced;
}

export async function beforePublishHook({ docsDir }) {
  // Process each markdown file to save d2 svg assets.
  const mdFilePaths = await glob("**/*.md", { cwd: docsDir });
  await pMap(
    mdFilePaths,
    async (filePath) => {
      let finalContent = await fs.readFile(path.join(docsDir, filePath), { encoding: "utf8" });
      finalContent = await saveAssets({ markdown: finalContent, docsDir });

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

export async function checkContent({ content: _content }) {
  const matches = Array.from(_content.matchAll(codeBlockRegex));
  let content = _content;
  if (matches.length > 0) {
    content = matches[0][1];
  }
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
    debug("Asset cache found, skipping generation", svgPath);
    return;
  }

  const svg = await getChart({ content: d2Content, strict: true });
  await fs.writeFile(svgPath, svg, { encoding: "utf8" });
}

export async function ensureTmpDir() {
  const tmpDir = path.join(DOC_SMITH_DIR, TMP_DIR);
  if (!(await fs.pathExists(path.join(tmpDir, ".gitignore")))) {
    await fs.ensureDir(tmpDir);
    await fs.writeFile(path.join(tmpDir, ".gitignore"), "**/*", { encoding: "utf8" });
  }
}

export function isValidCode(lang) {
  return lang?.toLowerCase() === "d2";
}

export function wrapCode({ content }) {
  const matches = Array.from(content.matchAll(codeBlockRegex));
  if (matches.length > 0) {
    return content;
  }

  return `\`\`\`d2\n${content}\n\`\`\``;
}

/**
 * Replaces D2 code block with DIAGRAM_PLACEHOLDER.
 * @param {string} content - Document content containing D2 code block
 * @returns {Array} - [contentWithPlaceholder, originalCodeBlock]
 */
export function replaceD2WithPlaceholder({ content }) {
  const [firstMatch] = Array.from(content.matchAll(codeBlockRegex));
  if (firstMatch) {
    const matchContent = firstMatch[0];
    const cleanContent = content.replace(matchContent, DIAGRAM_PLACEHOLDER);
    return [cleanContent, matchContent];
  }

  return [content, ""];
}

/**
 * Replaces DIAGRAM_PLACEHOLDER with D2 code block, ensuring proper spacing.
 * @param {string} content - Document content containing DIAGRAM_PLACEHOLDER
 * @param {string} diagramSourceCode - D2 diagram source code (without markdown wrapper)
 * @returns {string} - Content with placeholder replaced by code block
 */
export function replacePlaceholderWithD2({ content, diagramSourceCode }) {
  if (!content || !diagramSourceCode) {
    return content;
  }

  const placeholderIndex = content.indexOf(DIAGRAM_PLACEHOLDER);
  if (placeholderIndex === -1) {
    return content;
  }

  // Check if placeholder has newlines around it
  const beforePlaceholder = content.substring(0, placeholderIndex);
  const afterPlaceholder = content.substring(
    placeholderIndex + DIAGRAM_PLACEHOLDER.length,
  );

  const codeBlock = wrapCode({ content: diagramSourceCode });

  // Add newlines if missing
  let replacement = codeBlock;
  if (beforePlaceholder && !beforePlaceholder.endsWith("\n")) {
    replacement = `\n${replacement}`;
  }
  if (afterPlaceholder && !afterPlaceholder.startsWith("\n")) {
    replacement = `${replacement}\n`;
  }

  return content.replace(DIAGRAM_PLACEHOLDER, replacement);
}
