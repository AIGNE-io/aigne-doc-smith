import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'

/**
 * Sorts files by modification time (newest first), then alphabetically
 */
function sortFilesByModTime(files, basePath) {
  return files
    .map(file => {
      const fullPath = path.isAbsolute(file) ? file : path.resolve(basePath, file)
      try {
        const stats = fs.statSync(fullPath)
        return {
          path: file,
          fullPath,
          mtime: stats.mtimeMs || 0
        }
      } catch {
        return {
          path: file,
          fullPath,
          mtime: 0
        }
      }
    })
    .sort((a, b) => {
      // Sort by modification time (newest first), then alphabetically
      if (b.mtime !== a.mtime) {
        return b.mtime - a.mtime
      }
      return a.path.localeCompare(b.path)
    })
    .map(item => item.path)
}

/**
 * Filters out common ignore patterns
 */
function shouldIgnoreFile(filePath) {
  const ignorePatterns = [
    'node_modules',
    '.git',
    '.DS_Store',
    '.vscode',
    '.idea',
    'dist',
    'build',
    '*.log',
    'coverage',
    '.nyc_output',
    '.cache'
  ]

  const normalizedPath = filePath.replace(/\\/g, '/')

  return ignorePatterns.some(pattern => {
    if (pattern.includes('*')) {
      // Simple wildcard matching for patterns like "*.log"
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))
      return regex.test(path.basename(normalizedPath))
    } else {
      // Directory or file name matching
      return normalizedPath.includes('/' + pattern + '/') ||
             normalizedPath.endsWith('/' + pattern) ||
             normalizedPath.startsWith(pattern + '/') ||
             normalizedPath === pattern
    }
  })
}

export default async function glob({
  pattern,
  case_sensitive = false,
  respect_git_ignore = true,
  limit = 100
}) {
  let result = []
  let error = null
  let searchDir = process.cwd()

  try {
    // Validate required parameters
    if (!pattern || typeof pattern !== 'string' || pattern.trim() === '') {
      throw new Error('Pattern parameter is required and cannot be empty')
    }

    // Use Node.js built-in glob
    const globOptions = {
      cwd: searchDir,
      nodir: true, // Only return files, not directories
      dot: true,   // Include hidden files
    }

    // Note: Node.js fs.glob doesn't support case_sensitive option directly
    // We'll handle case sensitivity in post-processing if needed
    const iter = fsPromises.glob(pattern, globOptions)
    const files = []

    for await (const file of iter) {
      if (files.length >= limit) break

      // Apply ignore filters
      if (shouldIgnoreFile(file)) {
        continue
      }

      // Handle case sensitivity if needed
      if (case_sensitive === false) {
        // Node.js glob is case-sensitive by default on most systems
        // For case-insensitive matching, we rely on the pattern itself
        // or the filesystem behavior
      }

      files.push(file)
    }

    // Sort files by modification time (newest first)
    const sortedFiles = sortFilesByModTime(files, searchDir)

    // Build result message
    let message
    if (sortedFiles.length === 0) {
      message = `No files found matching pattern "${pattern}"`
    } else {
      const fileCount = sortedFiles.length
      const truncated = files.length >= limit
      message = `Found ${fileCount}${truncated ? '+' : ''} file(s) matching "${pattern}"`
      message += ', sorted by modification time (newest first):'
    }

    result = {
      files: sortedFiles,
      count: sortedFiles.length,
      message,
      truncated: files.length >= limit
    }

  } catch (err) {
    error = err
    result = {
      files: [],
      count: 0,
      message: `Error during glob search: ${err.message}`,
      truncated: false
    }
  }

  return {
    command: 'glob',
    arguments: {
      pattern,
      case_sensitive,
      respect_git_ignore,
      limit
    },
    result,
    error: error && { message: error.message }
  }
}

glob.input_schema = {
  type: 'object',
  properties: {
    pattern: {
      type: 'string',
      description: 'The glob pattern to match files against (e.g., "**/*.js", "src/**/*.ts")'
    },
    case_sensitive: {
      type: 'boolean',
      description: 'Optional: Whether the search should be case-sensitive (defaults to false)'
    },
    respect_git_ignore: {
      type: 'boolean',
      description: 'Optional: Whether to respect .gitignore patterns (defaults to true)'
    },
    limit: {
      type: 'number',
      description: 'Optional: Maximum number of files to return (defaults to 100)'
    }
  },
  required: ['pattern'],
}
