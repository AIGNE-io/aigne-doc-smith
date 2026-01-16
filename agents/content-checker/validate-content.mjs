import { readFile, access, readdir, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { parse as yamlParse } from "yaml";
import path from "node:path";
import { collectDocumentPaths } from "../../utils/document-paths.mjs";
import { PATHS, ERROR_CODES } from "../../utils/agent-constants.mjs";
import { isSourcesAbsolutePath, resolveSourcesPath } from "../../utils/sources-path-resolver.mjs";
import { loadConfigFromFile } from "../../utils/config.mjs";

/**
 * Document Content Validator Class
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
    this.workspaceConfig = null; // Cache workspace configuration
  }

  /**
   * Load workspace configuration (lazy loading)
   */
  async loadWorkspaceConfig() {
    if (this.workspaceConfig === null) {
      this.workspaceConfig = (await loadConfigFromFile()) || {};
    }
    return this.workspaceConfig;
  }

  /**
   * Load sources configuration (lazy loading)
   */
  async loadSourcesConfig() {
    const config = await this.loadWorkspaceConfig();
    return config.sources || [];
  }

  /**
   * Load translateLanguages configuration (lazy loading)
   */
  async loadTranslateLanguages() {
    const config = await this.loadWorkspaceConfig();
    return config.translateLanguages || [];
  }

  /**
   * Execute complete validation
   */
  async validate(checkRemoteImages = true) {
    try {
      // Layer 1: Load document structure and validate file existence
      await this.loadDocumentStructure();
      await this.validateDocumentFiles();

      // Layer 2-4: Check document content one by one
      for (const doc of this.documents) {
        await this.validateDocument(doc, checkRemoteImages);
      }

      return this.getResult();
    } catch (error) {
      this.errors.fatal.push({
        type: "VALIDATION_ERROR",
        message: `Validation error: ${error.message}`,
      });
      return this.getResult();
    }
  }

  /**
   * Layer 1: Load document structure
   */
  async loadDocumentStructure() {
    try {
      const content = await readFile(this.yamlPath, "utf8");
      const data = yamlParse(content);

      if (!data.documents || !Array.isArray(data.documents)) {
        throw new Error(`${this.yamlPath} missing documents field or format error`);
      }

      // Use shared tool to collect document paths and metadata
      const docsWithMeta = collectDocumentPaths(data.documents, { collectMetadata: true });

      // Convert to internal format
      for (const doc of docsWithMeta) {
        // If docs filter is specified, only add matching documents
        if (this.docsFilter && !this.docsFilter.has(doc.displayPath)) {
          // Still need to add to documentPaths for link validation
          this.documentPaths.add(doc.displayPath);
          continue;
        }

        this.documents.push({
          path: doc.displayPath,
          filePath: doc.path,
          title: doc.title || "Unknown document",
        });
        this.documentPaths.add(doc.displayPath);
      }

      this.stats.totalDocs = this.documents.length;
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`File not found: ${this.yamlPath}`);
      }
      throw error;
    }
  }

  /**
   * Layer 1: Validate document file existence
   */
  async validateDocumentFiles() {
    for (const doc of this.documents) {
      const docFolder = path.join(this.docsDir, doc.filePath);

      // Check 1: Folder exists and is a directory
      let folderExists = false;
      try {
        const stats = await stat(docFolder);
        if (!stats.isDirectory()) {
          this.errors.fatal.push({
            type: "INVALID_DOCUMENT_FOLDER",
            path: doc.path,
            filePath: docFolder,
            message: `Path is not a folder: ${doc.path}`,
            suggestion: "Please ensure path points to a folder",
          });
          continue;
        }
        folderExists = true;
      } catch (_error) {
        this.errors.fatal.push({
          type: "MISSING_DOCUMENT_FOLDER",
          path: doc.path,
          filePath: docFolder,
          message: `Document folder missing: ${doc.path}`,
          suggestion: `Please generate this document folder in the specified format`,
        });
        continue;
      }

      // Check 2: .meta.yaml exists and has correct format
      if (folderExists) {
        await this.validateMetaFile(docFolder, doc);

        // Check 3: At least one language file exists
        await this.validateLanguageFiles(docFolder, doc);
      }
    }
  }

  /**
   * Validate .meta.yaml
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
        message: `.meta.yaml missing: ${doc.path}`,
        suggestion: "Please create .meta.yaml in the document folder",
      });
      return;
    }

    // Read and validate content
    try {
      const content = await readFile(metaPath, "utf8");
      const meta = yamlParse(content);

      // Required field validation
      const requiredFields = ["kind", "source", "default"];
      for (const field of requiredFields) {
        if (!meta[field]) {
          this.errors.fatal.push({
            type: "INVALID_META",
            path: doc.path,
            field,
            message: `.meta.yaml missing required field "${field}": ${doc.path}`,
            suggestion: `Add ${field} field to .meta.yaml`,
          });
        }
      }

      // kind value validation
      if (meta.kind && meta.kind !== "doc") {
        this.errors.fatal.push({
          type: "INVALID_META",
          path: doc.path,
          field: "kind",
          message: `.meta.yaml kind should be "doc", currently "${meta.kind}"`,
          suggestion: "Change to kind: doc",
        });
      }

      // source and project locale consistency validation
      if (meta.source) {
        const config = await this.loadWorkspaceConfig();
        const projectLocale = config?.locale;
        if (projectLocale && meta.source !== projectLocale) {
          this.errors.fatal.push({
            type: ERROR_CODES.SOURCE_LOCALE_MISMATCH,
            path: doc.path,
            source: meta.source,
            locale: projectLocale,
            message: `Document source (${meta.source}) does not match project locale (${projectLocale}): ${doc.path}`,
            suggestion: `Change document source to "${projectLocale}", or regenerate the main language version of this document`,
          });
        }
      }
    } catch (error) {
      this.errors.fatal.push({
        type: "INVALID_META",
        path: doc.path,
        message: `.meta.yaml format error: ${error.message}`,
        suggestion: "Check if YAML syntax is correct",
      });
    }
  }

  /**
   * Validate language files
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
          message: `No language version files: ${doc.path}`,
          suggestion: "Please generate at least one language version file (e.g., zh.md, en.md)",
        });
        return;
      }

      // Check if default and source language files exist
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
              message: `Default language file missing: ${defaultFile}`,
              suggestion: `Generate ${defaultFile} or modify the default field in .meta.yaml`,
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
              message: `Source language file missing: ${sourceFile}`,
              suggestion: `Generate ${sourceFile} or modify the source field in .meta.yaml`,
            });
          }
        }

        // Check if target language files configured in translateLanguages exist
        const translateLanguages = await this.loadTranslateLanguages();
        if (translateLanguages.length > 0) {
          for (const lang of translateLanguages) {
            // Skip source language (source language doesn't need to be a translation target)
            if (lang === meta.source) continue;

            const langFile = `${lang}.md`;
            if (!langFiles.includes(langFile)) {
              this.errors.fatal.push({
                type: ERROR_CODES.MISSING_TRANSLATE_LANGUAGE,
                path: doc.path,
                lang,
                message: `Translation language file missing: ${langFile}`,
                suggestion: `Please translate document to ${lang} language, or remove ${lang} from translateLanguages in config.yaml`,
              });
            }
          }
        }
      } catch (_error) {
        // .meta.yaml errors already reported in validateMetaFile
      }
    } catch (error) {
      this.errors.fatal.push({
        type: "READ_FOLDER_ERROR",
        path: doc.path,
        message: `Cannot read document folder: ${error.message}`,
      });
    }
  }

  /**
   * Layer 2-4: Validate single document content
   */
  async validateDocument(doc, checkRemoteImages) {
    const docFolder = path.join(this.docsDir, doc.filePath);

    try {
      // Read .meta.yaml to get language list
      const metaPath = path.join(docFolder, ".meta.yaml");
      const metaContent = await readFile(metaPath, "utf8");
      const _meta = yamlParse(metaContent);

      // Get all language files
      const files = await readdir(docFolder);
      const langFiles = files.filter((f) => f.endsWith(".md") && !f.startsWith("."));

      // Check each language version
      for (const langFile of langFiles) {
        const fullPath = path.join(docFolder, langFile);
        const content = await readFile(fullPath, "utf8");

        this.stats.checkedDocs++;

        // Layer 2: Content parsing and checking
        this.checkEmptyDocument(content, doc, langFile);
        this.checkHeadingHierarchy(content, doc, langFile);

        // Layer 3: Link and image validation
        await this.validateLinks(content, doc, langFile);
        await this.validateImages(content, doc, langFile, checkRemoteImages);
      }
    } catch (_error) {
      // Errors already reported in Layer 1
    }
  }

  /**
   * Layer 4: Empty document detection
   */
  checkEmptyDocument(content, doc, langFile) {
    // Remove all headings
    let cleaned = content.replace(/^#{1,6}\s+.+$/gm, "");
    // Remove whitespace
    cleaned = cleaned.replace(/\s+/g, "");

    if (cleaned.length < 50) {
      this.errors.fatal.push({
        type: "EMPTY_DOCUMENT",
        path: doc.path,
        langFile,
        message: `Empty document: ${doc.path} (${langFile})`,
        suggestion: `Document content is insufficient (less than 50 characters), please add substantial content or remove from structure`,
      });
    }
  }

  /**
   * Layer 4: Heading hierarchy check
   */
  checkHeadingHierarchy(content, doc, langFile) {
    // First remove content in code blocks to avoid false positives
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

      // Check if heading level was skipped
      if (curr.level > prev.level + 1) {
        this.errors.fatal.push({
          type: "HEADING_SKIP",
          path: doc.path,
          langFile,
          line: curr.line,
          message: `Heading skipped from H${prev.level} to H${curr.level}`,
          suggestion: `Consider changing "${"#".repeat(curr.level)} ${curr.text}" to "${"#".repeat(prev.level + 1)} ${curr.text}"`,
        });
      }
    }
  }

  /**
   * Remove content in Markdown code blocks
   */
  removeCodeBlocks(content) {
    // Remove fenced code blocks (```...```)
    let result = content.replace(/^```[\s\S]*?^```$/gm, "");

    // Remove indented code blocks (lines starting with 4 spaces or 1 tab)
    result = result.replace(/^( {4}|\t).+$/gm, "");

    return result;
  }

  /**
   * Get position ranges of code blocks
   * @returns {Array<{start: number, end: number}>} Array of code block start/end positions
   */
  getCodeBlockRanges(content) {
    const ranges = [];

    // Match fenced code blocks (```...```)
    const fencedCodeRegex = /^```[\s\S]*?^```$/gm;

    for (const match of content.matchAll(fencedCodeRegex)) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Match inline code blocks (`...`)
    const inlineCodeRegex = /`[^`\n]+`/g;
    for (const match of content.matchAll(inlineCodeRegex)) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Match indented code blocks (lines starting with 4 spaces or 1 tab)
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
   * Check if position is inside a code block
   * @param {number} position - Position to check
   * @param {Array<{start: number, end: number}>} ranges - Array of code block ranges
   * @returns {boolean} Whether position is in a code block
   */
  isInCodeBlock(position, ranges) {
    return ranges.some((range) => position >= range.start && position < range.end);
  }

  /**
   * Layer 3: Validate internal links
   */
  async validateLinks(content, doc, langFile) {
    // Get code block position ranges
    const codeBlockRanges = this.getCodeBlockRanges(content);

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    for (const match of content.matchAll(linkRegex)) {
      // Check if link is in code block, skip if so
      if (this.isInCodeBlock(match.index, codeBlockRanges)) {
        continue;
      }

      const linkText = match[1];
      const linkUrl = match[2];

      this.stats.totalLinks++;

      // Ignore external links and anchor links
      if (
        linkUrl.startsWith("http://") ||
        linkUrl.startsWith("https://") ||
        linkUrl.startsWith("#")
      ) {
        continue;
      }

      // Ignore resource file links
      if (this.isResourceFile(linkUrl)) {
        continue;
      }

      // All other links are treated as internal document links
      await this.validateInternalLink(linkUrl, doc, linkText, langFile);
    }
  }

  /**
   * Check if link points to resource file (not document)
   */
  isResourceFile(url) {
    // Remove query parameters and anchors
    const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
    // Resource file extensions
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
   * Validate internal link
   */
  async validateInternalLink(linkUrl, doc, linkText, langFile) {
    let targetPath;

    // Remove anchor part for format checking
    const urlWithoutAnchor = linkUrl.split("#")[0];

    // Check if link format is correct: internal links should not contain .md suffix
    const langSuffixPattern = /\/[a-z]{2}(-[A-Z]{2})?\.md$/; // Match /en.md, /zh.md, /en-US.md
    const mdSuffixPattern = /\.md$/;

    if (mdSuffixPattern.test(urlWithoutAnchor)) {
      // Link contains .md suffix, this is a format error
      // If it's a language suffix pattern, remove the entire /xx.md part; otherwise only remove .md
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
        message: `Internal link format error: [${linkText}](${linkUrl})`,
        suggestion: `Link should not contain .md suffix, suggest changing to: ${suggestedLink}`,
      });
      return;
    }

    // Link format is correct, continue to validate target existence
    const cleanLinkUrl = urlWithoutAnchor;

    // If link is just an anchor (like #section), cleanLinkUrl will be empty string, skip check
    if (!cleanLinkUrl) {
      return;
    }

    if (cleanLinkUrl.startsWith("/")) {
      // Absolute path
      targetPath = cleanLinkUrl;
    } else {
      // Relative path: based on document's "containing directory"
      // Document /getting-started/claude-code's containing directory is /getting-started
      // Example: document /getting-started/claude-code, link ../getting-started -> /getting-started
      // Example: document /getting-started, link ./claude-code -> /getting-started/claude-code
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
          message: `Internal link path exceeds root directory: [${linkText}](${linkUrl})`,
          suggestion: `Link goes up ${upLevels} levels, but current document's directory is only at level ${currentDepth}`,
        });
        return;
      }

      // Merge document's containing directory and relative link
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
        message: `Internal broken link: [${linkText}](${linkUrl})`,
        suggestion: `Target document ${targetPath} does not exist`,
      });
    }
  }

  /**
   * Layer 3: Validate images
   */
  async validateImages(content, doc, langFile, checkRemoteImages) {
    // Get code block position ranges
    const codeBlockRanges = this.getCodeBlockRanges(content);

    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

    for (const match of content.matchAll(imageRegex)) {
      // Check if image is in code block, skip if so
      if (this.isInCodeBlock(match.index, codeBlockRanges)) {
        continue;
      }

      const altText = match[1];
      const imageUrl = match[2];

      this.stats.totalImages++;

      // Categorize: local vs remote
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        // Remote image
        this.stats.remoteImages++;
        if (checkRemoteImages) {
          await this.validateRemoteImage(imageUrl, doc, altText, langFile);
        }
      } else {
        // Local image
        this.stats.localImages++;
        await this.validateLocalImage(imageUrl, doc, altText, langFile);
      }
    }
  }

  /**
   * Validate local image
   */
  async validateLocalImage(imageUrl, doc, altText, langFile) {
    let imagePath;

    // Check if it's a /sources/... absolute path
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
          message: `Cannot find image in any source: ${imageUrl}`,
          suggestion: `Check if the image file exists in the sources directory`,
        });
        return;
      }
      imagePath = resolved.physicalPath;
    } else {
      // Original relative path handling logic
      const fullDocPath = path.join(doc.filePath, langFile);
      const docDir = path.dirname(path.join(this.docsDir, fullDocPath));
      imagePath = path.resolve(docDir, imageUrl);
    }

    // Check if file exists
    try {
      await access(imagePath, constants.F_OK);

      // Only validate path levels for relative paths (absolute paths don't need this)
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
            message: `Image path level may be incorrect: ${imageUrl}`,
            suggestion: `Suggest using: ${expectedRelativePath}`,
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
        message: `Local image does not exist: ${imageUrl}`,
        suggestion: `Check the image path or remove the image reference`,
      });
    }
  }

  /**
   * Calculate expected relative path
   */
  calculateExpectedRelativePath(docFilePath, absoluteImagePath) {
    // Calculate document level (levels under docs/ directory, including language file)
    // Example: overview/zh.md → ['overview', 'zh.md'] → 2 levels → ../../
    //          api/auth/zh.md → ['api', 'auth', 'zh.md'] → 3 levels → ../../../
    const pathParts = docFilePath.split("/").filter((p) => p);
    const depth = pathParts.length;

    // Generate back path
    const backPath = "../".repeat(depth);

    // Get workspace root directory
    const workspaceRoot = process.cwd();

    // Calculate image path relative to workspace
    const relativeToWorkspace = path.relative(workspaceRoot, absoluteImagePath);

    // Combine complete relative path
    return backPath + relativeToWorkspace.replace(/\\/g, "/");
  }

  /**
   * Validate remote image
   */
  async validateRemoteImage(imageUrl, doc, altText, langFile) {
    // Check cache
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
          message: `Remote image inaccessible: ${imageUrl}`,
          suggestion: `Check if URL is correct, or replace with an accessible image`,
        });
      }
      return;
    }

    // Check remote image accessibility
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
        message: `Remote image inaccessible: ${imageUrl}`,
        suggestion: `Check if URL is correct, or replace with an accessible image`,
      });
    }
  }

  /**
   * Check remote image (HTTP HEAD request)
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
   * Get validation result
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
 * Format output
 */
function formatOutput(result) {
  let output = "";

  if (result.valid) {
    output += "✅ PASS: Document content check passed\n\n";
    output += "Statistics:\n";
    output += `  Total documents: ${result.stats.totalDocs}\n`;
    output += `  Checked: ${result.stats.checkedDocs}\n`;
    output += `  Internal links: ${result.stats.totalLinks}\n`;
    output += `  Local images: ${result.stats.localImages}\n`;
    output += `  Remote images: ${result.stats.remoteImages}\n`;

    if (result.errors.warnings.length > 0) {
      output += `\nWarnings: ${result.errors.warnings.length}\n`;
    }

    return output;
  }

  output += "❌ FAIL: Document content has errors\n\n";
  output += "Statistics:\n";
  output += `  Total documents: ${result.stats.totalDocs}\n`;
  output += `  Checked: ${result.stats.checkedDocs}\n`;
  output += `  Fatal errors: ${result.errors.fatal.length}\n`;
  output += `  Fixable errors: ${result.errors.fixable.length}\n`;
  output += `  Warnings: ${result.errors.warnings.length}\n\n`;

  // FATAL errors
  if (result.errors.fatal.length > 0) {
    output += "Fatal errors (must fix):\n\n";
    result.errors.fatal.forEach((err, idx) => {
      output += `${idx + 1}. ${err.message}\n`;
      if (err.path) output += `   Document: ${err.path}\n`;
      if (err.link) output += `   Link: ${err.link}\n`;
      if (err.imageUrl) output += `   Image: ${err.imageUrl}\n`;
      if (err.suggestion) output += `   Action: ${err.suggestion}\n`;
      output += "\n";
    });
  }

  // FIXABLE errors
  if (result.errors.fixable.length > 0) {
    output += "Fixable errors (auto-fixed):\n";
    output += "(Fixes applied, files updated)\n\n";
  }

  // WARNING
  if (result.errors.warnings.length > 0) {
    output += "Warnings (non-blocking):\n\n";
    result.errors.warnings.forEach((warn, idx) => {
      output += `${idx + 1}. ${warn.message}\n`;
      if (warn.path) output += `   Document: ${warn.path}\n`;
      if (warn.suggestion) output += `   Suggestion: ${warn.suggestion}\n`;
      output += "\n";
    });
  }

  return output;
}

/**
 * Main function - Function Agent
 * @param {Object} params
 * @param {string} params.yamlPath - Document structure YAML file path
 * @param {string} params.docsDir - Document directory path
 * @param {string[]} params.docs - Array of document paths to check, e.g., ['/overview', '/api/introduction'], checks all documents if not provided
 * @param {boolean} params.checkRemoteImages - Whether to check remote images
 * @returns {Promise<Object>} - Validation result
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

// Note: This function is for internal use only, not directly exposed as a skill
// External calls are made through the checkContent function in content-checker.mjs
