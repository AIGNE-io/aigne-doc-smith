import { readFile } from "node:fs/promises";
import path from "node:path";
import { traverseMediaFiles } from "../utils/file-utils.mjs";

export default async function loadAssets({ docsDir }) {
  const assetsDir = path.join(docsDir, "assets");
  let initialContent = "";

  // Step 1: Try to read README.md from assets directory
  try {
    const readmePath = path.join(assetsDir, "README.md");
    initialContent = await readFile(readmePath, "utf8");
  } catch {
    // If README.md doesn't exist or can't be read, use empty string as default
    initialContent = "# 可用于文档生成的媒体资源\n\n";
  }

  // Step 2: Traverse assets directory to find media files
  const mediaExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".m4v",
  ];

  const mediaFiles = await traverseMediaFiles(assetsDir, docsDir, mediaExtensions);

  // Step 3: Generate markdown format for media files
  let mediaMarkdown = "";
  if (mediaFiles.length > 0) {
    mediaMarkdown = mediaFiles
      .map((file) => {
        // Use filename (without extension) as description
        const description = path.parse(file.name).name;
        return `![${description}](${file.path})`;
      })
      .join("\n\n");
  }

  // Step 4: Combine initial content with generated markdown
  let assetsContent = initialContent;
  if (mediaMarkdown) {
    if (assetsContent && !assetsContent.endsWith("\n")) {
      assetsContent += "\n\n";
    }
    assetsContent += mediaMarkdown;
  }

  return { assetsContent };
}

loadAssets.task_render_mode = "hide";
