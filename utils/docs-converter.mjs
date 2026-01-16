import { join, relative, dirname, basename } from "node:path";
import fs from "fs-extra";
import { parse as yamlParse } from "yaml";
import { parseSlots } from "./image-slots.mjs";
import { findImageWithFallback } from "./image-utils.mjs";
import { PATHS } from "./agent-constants.mjs";
import {
  isSourcesAbsolutePath,
  parseSourcesPath,
  resolveSourcesPath,
} from "./sources-path-resolver.mjs";
import { loadConfigFromFile } from "./config.mjs";

/**
 * 扫描文档目录，识别所有包含 .meta.yaml 的文档目录
 * @param {string} docsDir - 文档根目录路径
 * @returns {Promise<Array>} 文档列表，每个文档包含 {dirPath, dirName, locale, content, depth}
 */
export async function scanDocuments(docsDir) {
  const documents = [];

  async function scanDir(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    // 检查是否包含 .meta.yaml
    const hasMetaFile = entries.some((entry) => entry.isFile() && entry.name === ".meta.yaml");

    if (hasMetaFile) {
      // 这是一个文档目录，读取所有语言文件
      const markdownFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

      // 计算文档深度（相对于 docs/ 的层级）
      const relativePath = relative(docsDir, currentPath);
      const depth = relativePath === "" ? 0 : relativePath.split("/").length;

      const dirName = basename(currentPath);

      for (const file of markdownFiles) {
        const locale = file.name.replace(".md", "");
        const filePath = join(currentPath, file.name);
        const content = await fs.readFile(filePath, "utf8");

        documents.push({
          dirPath: currentPath,
          dirName,
          locale,
          content,
          depth,
          relativePath,
        });
      }
    }

    // 递归扫描子目录
    const subDirs = entries.filter((entry) => entry.isDirectory());
    for (const subDir of subDirs) {
      await scanDir(join(currentPath, subDir.name));
    }
  }

  await scanDir(docsDir);
  return documents;
}

/**
 * 根据文档深度和语言计算目标路径
 * @param {string} relativePath - 相对于 docs/ 的路径
 * @param {string} dirName - 文档目录名
 * @param {string} locale - 语言代码
 * @param {number} depth - 文档深度
 * @returns {string} 目标文件路径（相对于目标目录）
 */
export function getTargetPath(relativePath, dirName, locale, depth) {
  // 英文文档不带语言后缀，其他语言带后缀
  const suffix = locale === "en" ? ".md" : `.${locale}.md`;
  const fileName = `${dirName}${suffix}`;

  if (depth === 1) {
    // 单级路径：文件移到根目录
    return fileName;
  }

  // 多级路径：保留父级目录，文件名使用目录名
  const parentPath = dirname(relativePath);
  return join(parentPath, fileName);
}

/**
 * 为内部链接添加 .md 后缀
 * @param {string} content - 文档内容
 * @returns {string} 处理后的内容
 */
export function addMarkdownSuffixToLinks(content) {
  // 匹配 Markdown 链接：[text](path)
  // 但不匹配图片：![alt](path)
  // 不匹配外部链接（http:// 或 https://）
  // 不匹配已有 .md 后缀的链接
  // 不匹配媒体文件链接（图片、视频等）

  // 媒体文件扩展名
  const mediaExtensions = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|avi|pdf)$/i;

  return content.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // 跳过外部链接
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return match;
    }

    // 跳过已有 .md 后缀的链接
    if (url.includes(".md")) {
      return match;
    }

    // 跳过非文档链接（如 mailto:, #anchor 等）
    if (url.includes(":") || url.startsWith("#")) {
      return match;
    }

    // 跳过媒体文件链接（图片、视频、PDF 等）
    if (mediaExtensions.test(url)) {
      return match;
    }

    // 分离路径和锚点
    const hashIndex = url.indexOf("#");
    if (hashIndex !== -1) {
      const path = url.substring(0, hashIndex);
      const hash = url.substring(hashIndex);
      return `[${text}](${path}.md${hash})`;
    }

    // 添加 .md 后缀
    return `[${text}](${url}.md)`;
  });
}

/**
 * 调整图片路径（根据文档深度）
 * @param {string} content - 文档内容
 * @param {number} depth - 文档深度
 * @returns {string} 处理后的内容
 */
export function adjustImagePaths(content, depth) {
  // 深度 1 的文档向上移动一层，需要移除一个 ../
  // 深度 2+ 的文档路径保持不变

  if (depth !== 1) {
    return content;
  }

  // 匹配图片链接：![alt](path)
  return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, path) => {
    // 只处理相对路径（包含 ../ 的路径）
    if (!path.startsWith("../")) {
      return match;
    }

    // 移除一个 ../
    const newPath = path.replace(/^\.\.\//, "");
    return `![${alt}](${newPath})`;
  });
}

/**
 * 从配置文件读取主语言
 * @returns {Promise<string|null>} - 主语言代码，如果读取失败返回 null
 */
async function loadMainLocale() {
  try {
    const configPath = PATHS.CONFIG;
    if (!(await fs.pathExists(configPath))) {
      return null;
    }
    const content = await fs.readFile(configPath, "utf8");
    const config = yamlParse(content);
    return config?.locale || null;
  } catch (_error) {
    return null;
  }
}

/**
 * 替换文档中的 AFS image slots 为真实图片引用
 * @param {string} content - 文档内容
 * @param {string} docPath - 文档路径（用于计算相对路径和生成 key）
 * @param {string} locale - 当前文档语言
 * @param {string} mainLocale - 主语言
 * @param {number} depth - 文档深度（用于计算相对路径）
 * @param {string} assetsDir - assets 目录路径
 * @returns {Promise<string>} - 替换后的内容
 */
async function replaceImageSlots(
  content,
  docPath,
  locale,
  mainLocale,
  depth,
  assetsDir = PATHS.ASSETS_DIR,
) {
  // 解析所有 slots
  const slots = parseSlots(content, docPath);

  if (slots.length === 0) {
    return content;
  }

  // 替换每个 slot
  let result = content;
  for (const slot of slots) {
    const { key, desc, raw } = slot;

    // 查找图片
    const imagePath = await findImageWithFallback(key, locale, mainLocale, assetsDir);

    if (imagePath) {
      // 计算相对路径前缀
      // 目标文档至少在 targetDir 根目录下，需要至少 1 个 ../ 来访问与 targetDir 平级的 assets/
      // depth 0/1: ../assets/{key}/images/{lang}.jpg  (从 tmp-docs/overview.md 访问 assets/)
      // depth 2: ../../assets/{key}/images/{lang}.jpg  (从 tmp-docs/api/auth.md 访问 assets/)
      // depth N: N 个 ../ (最少 1 个)
      const pathPrefix = "../".repeat(Math.max(depth, 1));
      const imageRef = `${pathPrefix}assets/${imagePath}`;

      // 替换 slot 为图片引用
      const imageMarkdown = `![${desc}](${imageRef})`;
      result = result.replace(raw, imageMarkdown);
    }
    // 如果图片不存在，保持 slot 不变（或者可以选择移除）
  }

  return result;
}

/**
 * 处理单个 /sources/... 图片路径
 * @param {string} imagePath - 图片路径
 * @param {number} depth - 文档深度
 * @param {string} targetDir - 目标目录
 * @param {Array} sourcesConfig - sources 配置
 * @param {string} workspaceBase - workspace 基础路径
 * @param {Set} processedImages - 已处理的图片集合
 * @returns {Promise<{newPath: string, copied: boolean} | null>} - 新路径和是否复制了文件
 */
async function processSourcesImagePath(
  imagePath,
  depth,
  targetDir,
  sourcesConfig,
  workspaceBase,
  processedImages,
) {
  if (!isSourcesAbsolutePath(imagePath)) {
    return null;
  }

  // 解析路径，获取相对路径部分
  const relativePath = parseSourcesPath(imagePath);
  if (!relativePath) {
    console.warn(`⚠️  Invalid sources path format: ${imagePath}`);
    return null;
  }

  // 获取物理路径（自动在各个 source 中查找）
  const resolved = await resolveSourcesPath(imagePath, sourcesConfig, workspaceBase);
  if (!resolved) {
    console.warn(`⚠️  Cannot find image in any source: ${imagePath}`);
    return null;
  }

  const { physicalPath } = resolved;

  // 复制到临时目录的 sources 子目录
  // 保持与执行层相同的路径结构: targetDir/../sources/<relativePath>
  const targetImagePath = join(dirname(targetDir), "sources", relativePath);

  let copied = false;
  if (!processedImages.has(targetImagePath)) {
    await fs.ensureDir(dirname(targetImagePath));
    await fs.copy(physicalPath, targetImagePath);
    processedImages.add(targetImagePath);
    copied = true;
  }

  // 计算相对路径
  // depth 0/1: ../sources/path/to/image.png
  // depth 2: ../../sources/path/to/image.png
  const pathPrefix = "../".repeat(Math.max(depth, 1));
  const newPath = `${pathPrefix}sources/${relativePath}`;

  return { newPath, copied };
}

/**
 * 处理文档中的 /sources/... 绝对路径图片
 * 支持两种格式：
 * - Markdown: ![alt](/sources/path/to/image.png)
 * - HTML: <img src="/sources/path/to/image.png" ... />
 * @param {string} content - 文档内容
 * @param {number} depth - 文档深度（用于计算相对路径）
 * @param {string} targetDir - 目标目录（临时目录）
 * @param {Array} sourcesConfig - config.yaml 中的 sources 配置
 * @param {string} workspaceBase - workspace 基础路径
 * @returns {Promise<{content: string, copiedCount: number}>} - 处理后的内容和复制的图片数量
 */
async function processSourcesImages(content, depth, targetDir, sourcesConfig, workspaceBase) {
  let result = content;
  const processedImages = new Set();
  let copiedCount = 0;

  // 1. 处理 Markdown 格式图片: ![alt](/sources/path/to/image.png)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const markdownMatches = [...content.matchAll(markdownImageRegex)];

  for (const match of markdownMatches) {
    const [fullMatch, alt, imagePath] = match;

    const processResult = await processSourcesImagePath(
      imagePath,
      depth,
      targetDir,
      sourcesConfig,
      workspaceBase,
      processedImages,
    );

    if (processResult) {
      const { newPath, copied } = processResult;
      if (copied) copiedCount++;
      result = result.replace(fullMatch, `![${alt}](${newPath})`);
    }
  }

  // 2. 处理 HTML img 标签: <img src="/sources/path/to/image.png" ... />
  const htmlImgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)\/?>/gi;
  const htmlMatches = [...result.matchAll(htmlImgRegex)];

  for (const match of htmlMatches) {
    const [fullMatch, beforeSrc, imagePath, afterSrc] = match;

    const processResult = await processSourcesImagePath(
      imagePath,
      depth,
      targetDir,
      sourcesConfig,
      workspaceBase,
      processedImages,
    );

    if (processResult) {
      const { newPath, copied } = processResult;
      if (copied) copiedCount++;
      // 重建 img 标签，保持其他属性不变
      const newImgTag = `<img ${beforeSrc}src="${newPath}"${afterSrc}/>`;
      result = result.replace(fullMatch, newImgTag);
    }
  }

  return { content: result, copiedCount };
}

/**
 * 复制文档到临时目录并进行转换
 * @param {string} sourceDir - 源文档目录
 * @param {string} targetDir - 目标目录
 * @returns {Promise<Object>} 转换统计信息
 */
export async function copyDocumentsToTemp(sourceDir, targetDir) {
  // 扫描所有文档
  const documents = await scanDocuments(sourceDir);

  if (documents.length === 0) {
    console.warn("⚠️  No documents found to convert.");
    return { total: 0, converted: 0 };
  }

  // 读取主语言（用于图片回退）
  const mainLocale = await loadMainLocale();

  // 加载 sources 配置（用于处理 /sources/... 绝对路径）
  const config = await loadConfigFromFile();
  const sourcesConfig = config?.sources || [];

  const stats = {
    total: documents.length,
    converted: 0,
    depth1: 0,
    depth2Plus: 0,
    slotsReplaced: 0,
    sourcesCopied: 0,
  };

  // 处理每个文档
  for (const doc of documents) {
    const { relativePath, dirName, locale, content, depth } = doc;

    // 计算目标路径
    const targetPath = getTargetPath(relativePath, dirName, locale, depth);
    const fullTargetPath = join(targetDir, targetPath);

    // 处理内容
    let processedContent = content;

    // 1. 调整原始文档中的图片路径（必须在 replaceImageSlots 之前，避免处理新生成的路径）
    processedContent = adjustImagePaths(processedContent, depth);

    // 2. 替换 AFS image slots 为真实图片引用
    // 使用相对路径 relativePath 作为 docPath（需要添加前导 /）
    const docPath = relativePath ? `/${relativePath}` : `/${dirName}`;
    const contentBeforeSlotReplace = processedContent;
    processedContent = await replaceImageSlots(
      processedContent,
      docPath,
      locale,
      mainLocale,
      depth,
      PATHS.ASSETS_DIR,
    );
    // 统计替换的 slot 数量
    if (contentBeforeSlotReplace !== processedContent) {
      const slotsBefore = (contentBeforeSlotReplace.match(/<!--\s*afs:image/g) || []).length;
      const slotsAfter = (processedContent.match(/<!--\s*afs:image/g) || []).length;
      stats.slotsReplaced += slotsBefore - slotsAfter;
    }

    // 3. 处理 /sources/... 绝对路径图片
    if (sourcesConfig.length > 0) {
      const sourcesResult = await processSourcesImages(
        processedContent,
        depth,
        targetDir,
        sourcesConfig,
        PATHS.WORKSPACE_BASE,
      );
      processedContent = sourcesResult.content;
      stats.sourcesCopied += sourcesResult.copiedCount;
    }

    // 4. 为内部链接添加 .md 后缀
    processedContent = addMarkdownSuffixToLinks(processedContent);

    // 创建目标目录并写入文件
    await fs.ensureDir(dirname(fullTargetPath));
    await fs.writeFile(fullTargetPath, processedContent, "utf8");

    stats.converted++;
    if (depth === 1) {
      stats.depth1++;
    } else {
      stats.depth2Plus++;
    }
  }

  return stats;
}
