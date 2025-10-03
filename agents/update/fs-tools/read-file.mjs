import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path, { isAbsolute, join } from "node:path";

/**
 * Detects if a file is likely binary by checking for null bytes
 */
function isBinaryFile(buffer) {
  // Check first 8KB for null bytes
  const checkLength = Math.min(buffer.length, 8192);
  for (let i = 0; i < checkLength; i++) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}

/**
 * Gets MIME type based on file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    // Text files
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".json": "application/json",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".ts": "text/typescript",
    ".tsx": "text/typescript",
    ".jsx": "text/javascript",
    ".py": "text/x-python",
    ".java": "text/x-java",
    ".cpp": "text/x-c",
    ".c": "text/x-c",
    ".h": "text/x-c",
    ".css": "text/css",
    ".html": "text/html",
    ".xml": "text/xml",
    ".yaml": "text/yaml",
    ".yml": "text/yaml",
    ".toml": "text/plain",
    ".ini": "text/plain",
    ".cfg": "text/plain",
    ".conf": "text/plain",
    ".sh": "text/x-shellscript",
    ".bash": "text/x-shellscript",
    ".zsh": "text/x-shellscript",
    ".fish": "text/x-shellscript",

    // Image files
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".bmp": "image/bmp",
    ".ico": "image/x-icon",

    // Document files
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Other
    ".zip": "application/zip",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Validates file path and checks accessibility
 */
function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== "string" || filePath.trim() === "") {
    return "File path parameter is required and cannot be empty";
  }

  if (!path.isAbsolute(filePath)) {
    return `File path must be absolute, but was relative: ${filePath}`;
  }

  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return `Path is a directory, not a file: ${filePath}`;
    }
    return null;
  } catch (error) {
    if (error.code === "ENOENT") {
      return `File does not exist: ${filePath}`;
    } else if (error.code === "EACCES") {
      return `Permission denied: ${filePath}`;
    }
    return `Cannot access file: ${filePath} (${error.message})`;
  }
}

/**
 * Reads file content with proper handling for different file types
 */
async function readFileContent(filePath, offset = 0, limit = null, encoding = "utf8") {
  const stats = await fsPromises.stat(filePath);
  const fileSize = stats.size;
  const mimeType = getMimeType(filePath);

  // Handle binary files differently
  if (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    fileSize > 10 * 1024 * 1024
  ) {
    return {
      content: `[Binary file: ${path.basename(filePath)}]`,
      mimeType,
      fileSize,
      isBinary: true,
      encoding: null,
      lineCount: null,
      isTruncated: false,
    };
  }

  // Read file as buffer first to check if it's binary
  const buffer = await fsPromises.readFile(filePath);

  if (isBinaryFile(buffer)) {
    return {
      content: `[Binary file: ${path.basename(filePath)}]`,
      mimeType,
      fileSize,
      isBinary: true,
      encoding: null,
      lineCount: null,
      isTruncated: false,
    };
  }

  // Convert buffer to text
  let content = buffer.toString(encoding);
  const lines = content.split(/\r?\n/);
  const totalLines = lines.length;
  let isTruncated = false;
  let linesShown = [1, totalLines];

  // Handle offset and limit for text files
  if (offset > 0 || limit !== null) {
    const startLine = Math.max(0, offset);
    const endLine = limit !== null ? Math.min(startLine + limit, totalLines) : totalLines;

    if (startLine >= totalLines) {
      return {
        content: "",
        mimeType,
        fileSize,
        isBinary: false,
        encoding,
        lineCount: totalLines,
        isTruncated: false,
        linesShown: [startLine + 1, startLine + 1],
        message: `Offset ${offset} is beyond file end (file has ${totalLines} lines)`,
      };
    }

    const selectedLines = lines.slice(startLine, endLine);
    content = selectedLines.join("\n");
    isTruncated = startLine > 0 || endLine < totalLines;
    linesShown = [startLine + 1, endLine];
  }

  // Auto-truncate very large files (more than 10000 lines)
  const maxLines = 10000;
  if (limit === null && totalLines > maxLines) {
    const selectedLines = lines.slice(0, maxLines);
    content = selectedLines.join("\n");
    isTruncated = true;
    linesShown = [1, maxLines];
  }

  return {
    content,
    mimeType,
    fileSize,
    isBinary: false,
    encoding,
    lineCount: totalLines,
    isTruncated,
    linesShown,
  };
}

export default async function readFile({ path: filePath, offset, limit, encoding = "utf8" }) {
  let result = {};
  let error = null;

  try {
    // Validate file path first (this checks if it's absolute)
    const pathError = validateFilePath(filePath);
    if (pathError) {
      throw new Error(pathError);
    }

    // Now we know filePath is valid and absolute

    // Validate numeric parameters
    if (offset !== undefined && (typeof offset !== "number" || offset < 0)) {
      throw new Error("Offset must be a non-negative number");
    }

    if (limit !== undefined && (typeof limit !== "number" || limit <= 0)) {
      throw new Error("Limit must be a positive number");
    }

    // Read file content
    const fileResult = await readFileContent(filePath, offset, limit, encoding);

    // Build success result
    result = {
      content: fileResult.content,
      metadata: {
        path: filePath,
        mimeType: fileResult.mimeType,
        fileSize: fileResult.fileSize,
        isBinary: fileResult.isBinary,
        encoding: fileResult.encoding,
        lineCount: fileResult.lineCount,
      },
    };

    // Add truncation info if applicable
    if (fileResult.isTruncated) {
      result.truncated = {
        isTruncated: true,
        linesShown: fileResult.linesShown,
        totalLines: fileResult.lineCount,
        nextOffset: fileResult.linesShown[1],
      };

      // Add helpful message for truncated content
      const [start, end] = fileResult.linesShown;
      const nextOffset = end;
      result.message =
        `Content truncated. Showing lines ${start}-${end} of ${fileResult.lineCount} total lines. ` +
        `To read more, use offset: ${nextOffset}.`;
    }

    // Add message if provided
    if (fileResult.message) {
      result.message = fileResult.message;
    }
  } catch (err) {
    error = err;
    result = {
      content: null,
      metadata: {
        path: filePath,
        mimeType: null,
        fileSize: null,
        isBinary: null,
        encoding: null,
        lineCount: null,
      },
      message: `Error reading file: ${err.message}`,
    };
  }

  return {
    command: "read_file",
    arguments: {
      path: filePath,
      offset,
      limit,
      encoding,
    },
    result,
    error: error && { message: error.message },
  };
}

readFile.input_schema = {
  type: "object",
  properties: {
    path: {
      type: "string",
      description: "The path to the file to read (for backwards compatibility)",
    },
    offset: {
      type: "number",
      description: "Optional: The 0-based line number to start reading from",
    },
    limit: {
      type: "number",
      description: "Optional: Maximum number of lines to read",
    },
    encoding: {
      type: "string",
      description: "Optional: File encoding (defaults to utf8)",
    },
  },
  required: ["path"],
};
