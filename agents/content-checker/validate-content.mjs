import { readFile, access, readdir, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { parse as yamlParse } from "yaml";
import path from "node:path";
import { collectDocumentPaths } from "../../utils/document-paths.mjs";
import { PATHS, ERROR_CODES } from "../../utils/agent-constants.mjs";
import { isSourcesAbsolutePath, resolveSourcesPath } from "../../utils/sources-path-resolver.mjs";
import { loadConfigFromFile } from "../../utils/config.mjs";

/**
 * 文档内容校验器类
 */
class DocumentContentValidator {
  constructor(yamlPath = PATHS.DOCUMENT_STRUCTURE, docsDir = PATHS.DOCS_DIR, docs = undefined) {
    this.yamlPath = yamlPath;
    this.docsDir = docsDir;
    this.docsFilter = docs ? new Set(docs) : null;
    this.errors = {
      fatal: [],
      fixable: [],
      warnings: [],
    };
    this.stats = {
      totalDocs: 0,
      checkedDocs: 0,
      totalLinks: 0,
      totalImages: 0,
      localImages: 0,
      remoteImages: 0,
      brokenLinks: 0,
      missingImages: 0,
      inaccessibleRemoteImages: 0,
    };
    this.documents = [];
    this.documentPaths = new Set();
    this.remoteImageCache = new Map();
    this.workspaceConfig = null; // 缓存 workspace 配置
  }

  /**
   * 加载 workspace 配置（懒加载）
   */
  async loadWorkspaceConfig() {
    if (this.workspaceConfig === null) {
      this.workspaceConfig = (await loadConfigFromFile()) || {};
    }
    return this.workspaceConfig;
  }

  /**
   * 加载 sources 配置（懒加载）
   */
  async loadSourcesConfig() {
    const config = await this.loadWorkspaceConfig();
    return config.sources || [];
  }

  /**
   * 加载 translateLanguages 配置（懒加载）
   */
  async loadTranslateLanguages() {
    const config = await this.loadWorkspaceConfig();
    return config.translateLanguages || [];
  }

  /**
   * 执行完整校验
   */
  async validate(checkRemoteImages = true) {
    try {
      // Layer 1: 加载文档结构并验证文件存在性
      await this.loadDocumentStructure();
      await this.validateDocumentFiles();

      // Layer 2-4: 逐个检查文档内容
      for (const doc of this.documents) {
        await this.validateDocument(doc, checkRemoteImages);
      }

      return this.getResult();
    } catch (error) {
      this.errors.fatal.push({
        type: "VALIDATION_ERROR",
        message: `校验过程出错: ${error.message}`,
      });
      return this.getResult();
    }
  }

  /**
   * Layer 1: 加载文档结构
   */
  async loadDocumentStructure() {
    try {
      const content = await readFile(this.yamlPath, "utf8");
      const data = yamlParse(content);

      if (!data.documents || !Array.isArray(data.documents)) {
        throw new Error(`${this.yamlPath} 缺少 documents 字段或格式错误`);
      }

      // 使用共享工具收集文档路径和元数据
      const docsWithMeta = collectDocumentPaths(data.documents, { collectMetadata: true });

      // 转换为内部格式
      for (const doc of docsWithMeta) {
        // 如果指定了 docs 过滤器，则只添加匹配的文档
        if (this.docsFilter && !this.docsFilter.has(doc.displayPath)) {
          // 仍需添加到 documentPaths 用于链接验证
          this.documentPaths.add(doc.displayPath);
          continue;
        }

        this.documents.push({
          path: doc.displayPath,
          filePath: doc.path,
          title: doc.title || "未知文档",
        });
        this.documentPaths.add(doc.displayPath);
      }

      this.stats.totalDocs = this.documents.length;
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`文件不存在: ${this.yamlPath}`);
      }
      throw error;
    }
  }

  /**
   * Layer 1: 验证文档文件存在性
   */
  async validateDocumentFiles() {
    for (const doc of this.documents) {
      const docFolder = path.join(this.docsDir, doc.filePath);

      // 检查 1: 文件夹存在且是目录
      let folderExists = false;
      try {
        const stats = await stat(docFolder);
        if (!stats.isDirectory()) {
          this.errors.fatal.push({
            type: "INVALID_DOCUMENT_FOLDER",
            path: doc.path,
            filePath: docFolder,
            message: `路径不是文件夹: ${doc.path}`,
            suggestion: "请确保 path 指向文件夹",
          });
          continue;
        }
        folderExists = true;
      } catch (_error) {
        this.errors.fatal.push({
          type: "MISSING_DOCUMENT_FOLDER",
          path: doc.path,
          filePath: docFolder,
          message: `文档文件夹缺失: ${doc.path}`,
          suggestion: `请生成此文档文件夹，按指定格式生成文档`,
        });
        continue;
      }

      // 检查 2: .meta.yaml 存在且格式正确
      if (folderExists) {
        await this.validateMetaFile(docFolder, doc);

        // 检查 3: 至少有一个语言文件
        await this.validateLanguageFiles(docFolder, doc);
      }
    }
  }

  /**
   * 校验 .meta.yaml
   */
  async validateMetaFile(docFolder, doc) {
    const metaPath = path.join(docFolder, ".meta.yaml");

    try {
      await access(metaPath, constants.F_OK | constants.R_OK);
    } catch (_error) {
      this.errors.fatal.push({
        type: "MISSING_META_FILE",
        path: doc.path,
        filePath: metaPath,
        message: `.meta.yaml 缺失: ${doc.path}`,
        suggestion: "请在文档文件夹中创建 .meta.yaml",
      });
      return;
    }

    // 读取并校验内容
    try {
      const content = await readFile(metaPath, "utf8");
      const meta = yamlParse(content);

      // 必需字段校验
      const requiredFields = ["kind", "source", "default"];
      for (const field of requiredFields) {
        if (!meta[field]) {
          this.errors.fatal.push({
            type: "INVALID_META",
            path: doc.path,
            field,
            message: `.meta.yaml 缺少必需字段 "${field}": ${doc.path}`,
            suggestion: `添加 ${field} 字段到 .meta.yaml`,
          });
        }
      }

      // kind 值校验
      if (meta.kind && meta.kind !== "doc") {
        this.errors.fatal.push({
          type: "INVALID_META",
          path: doc.path,
          field: "kind",
          message: `.meta.yaml 的 kind 应为 "doc"，当前为 "${meta.kind}"`,
          suggestion: "修改为 kind: doc",
        });
      }

      // source 与项目 locale 一致性校验
      if (meta.source) {
        const config = await this.loadWorkspaceConfig();
        const projectLocale = config?.locale;
        if (projectLocale && meta.source !== projectLocale) {
          this.errors.fatal.push({
            type: ERROR_CODES.SOURCE_LOCALE_MISMATCH,
            path: doc.path,
            source: meta.source,
            locale: projectLocale,
            message: `文档 source (${meta.source}) 与项目 locale (${projectLocale}) 不一致: ${doc.path}`,
            suggestion: `修改文档的 source 为 "${projectLocale}"，或重新生成该文档的主语言版本`,
          });
        }
      }
    } catch (error) {
      this.errors.fatal.push({
        type: "INVALID_META",
        path: doc.path,
        message: `.meta.yaml 格式错误: ${error.message}`,
        suggestion: "检查 YAML 语法是否正确",
      });
    }
  }

  /**
   * 校验语言文件
   */
  async validateLanguageFiles(docFolder, doc) {
    try {
      const files = await readdir(docFolder);
      const langFiles = files.filter(
        (f) => f.endsWith(".md") && !f.startsWith(".") && /^[a-z]{2}(-[A-Z]{2})?\.md$/.test(f),
      );

      if (langFiles.length === 0) {
        this.errors.fatal.push({
          type: "MISSING_LANGUAGE_FILE",
          path: doc.path,
          message: `没有语言版本文件: ${doc.path}`,
          suggestion: "请生成至少一个语言版本文件（如 zh.md, en.md）",
        });
        return;
      }

      // 检查 default 和 source 语言文件是否存在
      const metaPath = path.join(docFolder, ".meta.yaml");
      try {
        const metaContent = await readFile(metaPath, "utf8");
        const meta = yamlParse(metaContent);

        if (meta.default) {
          const defaultFile = `${meta.default}.md`;
          if (!langFiles.includes(defaultFile)) {
            this.errors.fatal.push({
              type: "MISSING_DEFAULT_LANGUAGE",
              path: doc.path,
              defaultLang: meta.default,
              message: `默认语言文件缺失: ${defaultFile}`,
              suggestion: `生成 ${defaultFile} 或修改 .meta.yaml 中的 default 字段`,
            });
          }
        }

        if (meta.source) {
          const sourceFile = `${meta.source}.md`;
          if (!langFiles.includes(sourceFile)) {
            this.errors.fatal.push({
              type: "MISSING_SOURCE_LANGUAGE",
              path: doc.path,
              sourceLang: meta.source,
              message: `源语言文件缺失: ${sourceFile}`,
              suggestion: `生成 ${sourceFile} 或修改 .meta.yaml 中的 source 字段`,
            });
          }
        }

        // 检查 translateLanguages 中配置的目标语言文件是否存在
        const translateLanguages = await this.loadTranslateLanguages();
        if (translateLanguages.length > 0) {
          for (const lang of translateLanguages) {
            // 跳过源语言（源语言不需要作为翻译目标）
            if (lang === meta.source) continue;

            const langFile = `${lang}.md`;
            if (!langFiles.includes(langFile)) {
              this.errors.fatal.push({
                type: ERROR_CODES.MISSING_TRANSLATE_LANGUAGE,
                path: doc.path,
                lang,
                message: `翻译语言文件缺失: ${langFile}`,
                suggestion: `请翻译文档到 ${lang} 语言，或从 config.yaml 的 translateLanguages 中移除 ${lang}`,
              });
            }
          }
        }
      } catch (_error) {
        // .meta.yaml 错误已在 validateMetaFile 中报告
      }
    } catch (error) {
      this.errors.fatal.push({
        type: "READ_FOLDER_ERROR",
        path: doc.path,
        message: `无法读取文档文件夹: ${error.message}`,
      });
    }
  }

  /**
   * Layer 2-4: 验证单个文档内容
   */
  async validateDocument(doc, checkRemoteImages) {
    const docFolder = path.join(this.docsDir, doc.filePath);

    try {
      // 读取 .meta.yaml 获取语言列表
      const metaPath = path.join(docFolder, ".meta.yaml");
      const metaContent = await readFile(metaPath, "utf8");
      const _meta = yamlParse(metaContent);

      // 获取所有语言文件
      const files = await readdir(docFolder);
      const langFiles = files.filter((f) => f.endsWith(".md") && !f.startsWith("."));

      // 检查每个语言版本
      for (const langFile of langFiles) {
        const fullPath = path.join(docFolder, langFile);
        const content = await readFile(fullPath, "utf8");

        this.stats.checkedDocs++;

        // Layer 2: 内容解析和检查
        this.checkEmptyDocument(content, doc, langFile);
        this.checkHeadingHierarchy(content, doc, langFile);

        // Layer 3: 链接和图片验证
        await this.validateLinks(content, doc, langFile);
        await this.validateImages(content, doc, langFile, checkRemoteImages);
      }
    } catch (_error) {
      // 错误已在 Layer 1 报告
    }
  }

  /**
   * Layer 4: 空文档检测
   */
  checkEmptyDocument(content, doc, langFile) {
    // 移除所有标题
    let cleaned = content.replace(/^#{1,6}\s+.+$/gm, "");
    // 移除空白字符
    cleaned = cleaned.replace(/\s+/g, "");

    if (cleaned.length < 50) {
      this.errors.fatal.push({
        type: "EMPTY_DOCUMENT",
        path: doc.path,
        langFile,
        message: `空文档: ${doc.path} (${langFile})`,
        suggestion: `文档内容不足（少于50字符），请补充实质内容或从结构中移除`,
      });
    }
  }

  /**
   * Layer 4: 标题层级检查
   */
  checkHeadingHierarchy(content, doc, langFile) {
    // 先移除代码块中的内容，避免误判
    const contentWithoutCodeBlocks = this.removeCodeBlocks(content);

    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];

    for (const match of contentWithoutCodeBlocks.matchAll(headingRegex)) {
      headings.push({
        level: match[1].length,
        text: match[2],
        line: contentWithoutCodeBlocks.substring(0, match.index).split("\n").length,
      });
    }

    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1];
      const curr = headings[i];

      // 检查是否跳级
      if (curr.level > prev.level + 1) {
        this.errors.fatal.push({
          type: "HEADING_SKIP",
          path: doc.path,
          langFile,
          line: curr.line,
          message: `标题从 H${prev.level} 跳到 H${curr.level}`,
          suggestion: `考虑将 "${"#".repeat(curr.level)} ${curr.text}" 改为 "${"#".repeat(prev.level + 1)} ${curr.text}"`,
        });
      }
    }
  }

  /**
   * 移除 Markdown 代码块中的内容
   */
  removeCodeBlocks(content) {
    // 移除围栏代码块（```...```）
    let result = content.replace(/^```[\s\S]*?^```$/gm, "");

    // 移除缩进代码块（4个空格或1个tab开头的行）
    result = result.replace(/^( {4}|\t).+$/gm, "");

    return result;
  }

  /**
   * 获取代码块的位置范围
   * @returns {Array<{start: number, end: number}>} 代码块的起止位置数组
   */
  getCodeBlockRanges(content) {
    const ranges = [];

    // 匹配围栏代码块（```...```）
    const fencedCodeRegex = /^```[\s\S]*?^```$/gm;

    for (const match of content.matchAll(fencedCodeRegex)) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // 匹配行内代码块（`...`）
    const inlineCodeRegex = /`[^`\n]+`/g;
    for (const match of content.matchAll(inlineCodeRegex)) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // 匹配缩进代码块（4个空格或1个tab开头的行）
    const indentedCodeRegex = /^( {4}|\t).+$/gm;
    for (const match of content.matchAll(indentedCodeRegex)) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return ranges;
  }

  /**
   * 检查位置是否在代码块中
   * @param {number} position - 要检查的位置
   * @param {Array<{start: number, end: number}>} ranges - 代码块范围数组
   * @returns {boolean} 是否在代码块中
   */
  isInCodeBlock(position, ranges) {
    return ranges.some((range) => position >= range.start && position < range.end);
  }

  /**
   * Layer 3: 验证内部链接
   */
  async validateLinks(content, doc, langFile) {
    // 获取代码块位置范围
    const codeBlockRanges = this.getCodeBlockRanges(content);

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    for (const match of content.matchAll(linkRegex)) {
      // 检查链接是否在代码块中，如果是则跳过
      if (this.isInCodeBlock(match.index, codeBlockRanges)) {
        continue;
      }

      const linkText = match[1];
      const linkUrl = match[2];

      this.stats.totalLinks++;

      // 忽略外部链接和锚点链接
      if (
        linkUrl.startsWith("http://") ||
        linkUrl.startsWith("https://") ||
        linkUrl.startsWith("#")
      ) {
        continue;
      }

      // 忽略资源文件链接
      if (this.isResourceFile(linkUrl)) {
        continue;
      }

      // 所有其他链接都视为内部文档链接
      await this.validateInternalLink(linkUrl, doc, linkText, langFile);
    }
  }

  /**
   * 检查链接是否指向资源文件（非文档）
   */
  isResourceFile(url) {
    // 移除查询参数和锚点
    const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
    // 资源文件扩展名
    const resourceExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".webp",
      ".ico",
      ".bmp",
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".zip",
      ".tar",
      ".gz",
      ".rar",
      ".7z",
      ".mp3",
      ".mp4",
      ".wav",
      ".avi",
      ".mov",
      ".webm",
      ".json",
      ".xml",
      ".csv",
      ".txt",
      ".js",
      ".ts",
      ".css",
      ".scss",
      ".less",
      ".py",
      ".rb",
      ".go",
      ".rs",
      ".java",
      ".c",
      ".cpp",
      ".h",
    ];
    return resourceExtensions.some((ext) => cleanUrl.endsWith(ext));
  }

  /**
   * 验证内部链接
   */
  async validateInternalLink(linkUrl, doc, linkText, langFile) {
    let targetPath;

    // 移除锚点部分用于格式检查
    const urlWithoutAnchor = linkUrl.split("#")[0];

    // 检查链接格式是否正确：内部链接不应包含 .md 后缀
    const langSuffixPattern = /\/[a-z]{2}(-[A-Z]{2})?\.md$/; // 匹配 /en.md, /zh.md, /en-US.md
    const mdSuffixPattern = /\.md$/;

    if (mdSuffixPattern.test(urlWithoutAnchor)) {
      // 链接包含 .md 后缀，这是格式错误
      // 如果是语言后缀模式，去掉整个 /xx.md 部分；否则只去掉 .md
      const isLangSuffix = langSuffixPattern.test(urlWithoutAnchor);
      const suggestedLink = isLangSuffix
        ? urlWithoutAnchor.replace(langSuffixPattern, "")
        : urlWithoutAnchor.replace(mdSuffixPattern, "");

      this.stats.brokenLinks++;
      this.errors.fatal.push({
        type: ERROR_CODES.INVALID_LINK_FORMAT,
        path: doc.path,
        langFile,
        link: linkUrl,
        linkText,
        message: `内部链接格式错误: [${linkText}](${linkUrl})`,
        suggestion: `链接不应包含 .md 后缀，建议改为: ${suggestedLink}`,
      });
      return;
    }

    // 链接格式正确，继续验证目标是否存在
    const cleanLinkUrl = urlWithoutAnchor;

    // 如果链接只是锚点（如 #section），cleanLinkUrl 会是空字符串，跳过检查
    if (!cleanLinkUrl) {
      return;
    }

    if (cleanLinkUrl.startsWith("/")) {
      // 绝对路径
      targetPath = cleanLinkUrl;
    } else {
      // 相对路径：基于文档的"所在目录"
      // 文档 /getting-started/claude-code 的所在目录是 /getting-started
      // 例如：文档 /getting-started/claude-code，链接 ../getting-started -> /getting-started
      // 例如：文档 /getting-started，链接 ./claude-code -> /getting-started/claude-code
      const docDir = path.dirname(doc.path); // /getting-started/claude-code -> /getting-started
      const upLevels = (cleanLinkUrl.match(/\.\.\//g) || []).length;
      const currentDepth = docDir === "/" ? 0 : docDir.split("/").filter((p) => p).length;

      if (upLevels > currentDepth) {
        this.stats.brokenLinks++;
        this.errors.fatal.push({
          type: "BROKEN_LINK",
          path: doc.path,
          langFile,
          link: linkUrl,
          linkText,
          message: `内部链接路径超出根目录: [${linkText}](${linkUrl})`,
          suggestion: `链接向上 ${upLevels} 级，但当前文档所在目录只在第 ${currentDepth} 层`,
        });
        return;
      }

      // 将文档所在目录和相对链接合并
      targetPath = path.posix.normalize(path.posix.join(docDir, cleanLinkUrl));
      if (!targetPath.startsWith("/")) {
        targetPath = `/${targetPath}`;
      }
    }

    if (!this.documentPaths.has(targetPath)) {
      this.stats.brokenLinks++;
      this.errors.fatal.push({
        type: "BROKEN_LINK",
        path: doc.path,
        langFile,
        link: linkUrl,
        linkText,
        targetPath,
        message: `内部链接死链: [${linkText}](${linkUrl})`,
        suggestion: `目标文档 ${targetPath} 不存在`,
      });
    }
  }

  /**
   * Layer 3: 验证图片
   */
  async validateImages(content, doc, langFile, checkRemoteImages) {
    // 获取代码块位置范围
    const codeBlockRanges = this.getCodeBlockRanges(content);

    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

    for (const match of content.matchAll(imageRegex)) {
      // 检查图片是否在代码块中，如果是则跳过
      if (this.isInCodeBlock(match.index, codeBlockRanges)) {
        continue;
      }

      const altText = match[1];
      const imageUrl = match[2];

      this.stats.totalImages++;

      // 分类：本地 vs 远程
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        // 远程图片
        this.stats.remoteImages++;
        if (checkRemoteImages) {
          await this.validateRemoteImage(imageUrl, doc, altText, langFile);
        }
      } else {
        // 本地图片
        this.stats.localImages++;
        await this.validateLocalImage(imageUrl, doc, altText, langFile);
      }
    }
  }

  /**
   * 验证本地图片
   */
  async validateLocalImage(imageUrl, doc, altText, langFile) {
    let imagePath;

    // 检查是否为 /sources/... 绝对路径
    if (isSourcesAbsolutePath(imageUrl)) {
      const sourcesConfig = await this.loadSourcesConfig();
      const resolved = await resolveSourcesPath(imageUrl, sourcesConfig, PATHS.WORKSPACE_BASE);

      if (!resolved) {
        this.stats.missingImages++;
        this.errors.fatal.push({
          type: "INVALID_SOURCES_PATH",
          path: doc.path,
          langFile,
          imageUrl,
          altText,
          message: `无法在任何 source 中找到图片: ${imageUrl}`,
          suggestion: `检查 sources 目录下是否存在该图片文件`,
        });
        return;
      }
      imagePath = resolved.physicalPath;
    } else {
      // 原有的相对路径处理逻辑
      const fullDocPath = path.join(doc.filePath, langFile);
      const docDir = path.dirname(path.join(this.docsDir, fullDocPath));
      imagePath = path.resolve(docDir, imageUrl);
    }

    // 检查文件是否存在
    try {
      await access(imagePath, constants.F_OK);

      // 仅对相对路径进行层级验证（绝对路径不需要）
      if (!isSourcesAbsolutePath(imageUrl)) {
        const fullDocPath = path.join(doc.filePath, langFile);
        const expectedRelativePath = this.calculateExpectedRelativePath(fullDocPath, imagePath);
        if (expectedRelativePath && imageUrl !== expectedRelativePath) {
          this.errors.warnings.push({
            type: "IMAGE_PATH_LEVEL",
            path: doc.path,
            langFile,
            imageUrl,
            expectedPath: expectedRelativePath,
            message: `图片路径层级可能不正确: ${imageUrl}`,
            suggestion: `建议使用: ${expectedRelativePath}`,
          });
        }
      }
    } catch (_error) {
      this.stats.missingImages++;
      this.errors.fatal.push({
        type: "MISSING_IMAGE",
        path: doc.path,
        langFile,
        imageUrl,
        altText,
        message: `本地图片不存在: ${imageUrl}`,
        suggestion: `检查图片路径或删除图片引用`,
      });
    }
  }

  /**
   * 计算期望的相对路径
   */
  calculateExpectedRelativePath(docFilePath, absoluteImagePath) {
    // 计算文档层级（docs/ 目录下的层级，包含语言文件）
    // 例如：overview/zh.md → ['overview', 'zh.md'] → 2层 → ../../
    //       api/auth/zh.md → ['api', 'auth', 'zh.md'] → 3层 → ../../../
    const pathParts = docFilePath.split("/").filter((p) => p);
    const depth = pathParts.length;

    // 生成回退路径
    const backPath = "../".repeat(depth);

    // 获取工作区根目录
    const workspaceRoot = process.cwd();

    // 计算图片相对于工作区的路径
    const relativeToWorkspace = path.relative(workspaceRoot, absoluteImagePath);

    // 组合完整相对路径
    return backPath + relativeToWorkspace.replace(/\\/g, "/");
  }

  /**
   * 验证远程图片
   */
  async validateRemoteImage(imageUrl, doc, altText, langFile) {
    // 检查缓存
    if (this.remoteImageCache.has(imageUrl)) {
      const cached = this.remoteImageCache.get(imageUrl);
      if (!cached.accessible) {
        this.stats.inaccessibleRemoteImages++;
        this.errors.warnings.push({
          type: "REMOTE_IMAGE_INACCESSIBLE",
          path: doc.path,
          langFile,
          imageUrl,
          altText,
          statusCode: cached.statusCode,
          error: cached.error,
          message: `远程图片无法访问: ${imageUrl}`,
          suggestion: `检查 URL 是否正确，或替换为可访问的图片`,
        });
      }
      return;
    }

    // 检查远程图片可访问性
    const result = await this.checkRemoteImage(imageUrl);
    this.remoteImageCache.set(imageUrl, result);

    if (!result.accessible) {
      this.stats.inaccessibleRemoteImages++;
      this.errors.warnings.push({
        type: "REMOTE_IMAGE_INACCESSIBLE",
        path: doc.path,
        langFile,
        imageUrl,
        altText,
        statusCode: result.statusCode,
        error: result.error,
        message: `远程图片无法访问: ${imageUrl}`,
        suggestion: `检查 URL 是否正确，或替换为可访问的图片`,
      });
    }
  }

  /**
   * 检查远程图片（HTTP HEAD 请求）
   */
  async checkRemoteImage(url, timeout = 3000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "DocSmith-Content-Checker/1.0",
        },
      });

      clearTimeout(timeoutId);

      return {
        accessible: response.ok,
        statusCode: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      return {
        accessible: false,
        error: error.message,
        isTimeout: error.name === "AbortError",
      };
    }
  }

  /**
   * 获取校验结果
   */
  getResult() {
    const hasErrors = this.errors.fatal.length > 0 || this.errors.fixable.length > 0;

    return {
      valid: !hasErrors,
      errors: this.errors,
      stats: this.stats,
    };
  }
}

/**
 * 格式化输出
 */
function formatOutput(result) {
  let output = "";

  if (result.valid) {
    output += "✅ PASS: 文档内容检查通过\n\n";
    output += "统计信息:\n";
    output += `  总文档数: ${result.stats.totalDocs}\n`;
    output += `  已检查: ${result.stats.checkedDocs}\n`;
    output += `  内部链接: ${result.stats.totalLinks}\n`;
    output += `  本地图片: ${result.stats.localImages}\n`;
    output += `  远程图片: ${result.stats.remoteImages}\n`;

    if (result.errors.warnings.length > 0) {
      output += `\n警告: ${result.errors.warnings.length}\n`;
    }

    return output;
  }

  output += "❌ FAIL: 文档内容存在错误\n\n";
  output += "统计信息:\n";
  output += `  总文档数: ${result.stats.totalDocs}\n`;
  output += `  已检查: ${result.stats.checkedDocs}\n`;
  output += `  致命错误: ${result.errors.fatal.length}\n`;
  output += `  可修复错误: ${result.errors.fixable.length}\n`;
  output += `  警告: ${result.errors.warnings.length}\n\n`;

  // FATAL 错误
  if (result.errors.fatal.length > 0) {
    output += "致命错误（必须修复）:\n\n";
    result.errors.fatal.forEach((err, idx) => {
      output += `${idx + 1}. ${err.message}\n`;
      if (err.path) output += `   文档: ${err.path}\n`;
      if (err.link) output += `   链接: ${err.link}\n`;
      if (err.imageUrl) output += `   图片: ${err.imageUrl}\n`;
      if (err.suggestion) output += `   操作: ${err.suggestion}\n`;
      output += "\n";
    });
  }

  // FIXABLE 错误
  if (result.errors.fixable.length > 0) {
    output += "可修复错误（已自动修复）:\n";
    output += "（已应用修复，文件已更新）\n\n";
  }

  // WARNING
  if (result.errors.warnings.length > 0) {
    output += "警告（不阻断）:\n\n";
    result.errors.warnings.forEach((warn, idx) => {
      output += `${idx + 1}. ${warn.message}\n`;
      if (warn.path) output += `   文档: ${warn.path}\n`;
      if (warn.suggestion) output += `   建议: ${warn.suggestion}\n`;
      output += "\n";
    });
  }

  return output;
}

/**
 * 主函数 - Function Agent
 * @param {Object} params
 * @param {string} params.yamlPath - 文档结构 YAML 文件路径
 * @param {string} params.docsDir - 文档目录路径
 * @param {string[]} params.docs - 要检查的文档路径数组，如 ['/overview', '/api/introduction']，如果不提供则检查所有文档
 * @param {boolean} params.checkRemoteImages - 是否检查远程图片
 * @returns {Promise<Object>} - 校验结果
 */
export default async function validateDocumentContent({
  yamlPath = PATHS.DOCUMENT_STRUCTURE,
  docsDir = PATHS.DOCS_DIR,
  docs = undefined,
  checkRemoteImages = true,
} = {}) {
  try {
    const validator = new DocumentContentValidator(yamlPath, docsDir, docs);
    const result = await validator.validate(checkRemoteImages);

    const formattedOutput = formatOutput(result);

    return {
      valid: result.valid,
      errors: result.errors,
      stats: result.stats,
      message: formattedOutput,
    };
  } catch (error) {
    return {
      valid: false,
      message: `❌ FAIL: ${error.message}`,
    };
  }
}

// 注意：此函数仅供内部使用，不直接暴露为 skill
// 外部通过 content-checker.mjs 的 checkContent 函数调用
